// ==UserScript==
// @name         ChatGPT Collapse and Expand Messages brr
// @namespace    https://github.com/ChinaGodMan/UserScripts
// @version      1.6.0
// @description  Add "Collapse or Expand" buttons to ChatGPT messages. Auto-collapse specific user phrases. Keeps native user-message controls visible; user messages expand while being edited. Stable (no collapse/expand loops) and scroll-friendly.
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const autoCollapsePhrases = [
        "This message should automatically and always be collapsed",
        "This prompt must automatically and always be folded",
        "Ce message doit automatiquement et toujours être replié",
        " to explain is:",
        "sentence to translate into ",
        "à traduire en ",
        "Other additional sections",
        "extract only the following specific sections",
        "Autres sections supplémentaires pour le mot",
        "pour la forme pronominale:",
        "The target lexical entry to analyze is:",
        "L’entrée lexicale faisant l’objet de l’analyse est :",
        "Please now proceed with the presentation of",
        "Yes, continue while strictly maintaining",
        "Oui, poursuivez en conservant",
        "inclus de section consacrée à l’explication de la forme pronominale",
        "🧭 Règle de référence",
        "🧭 Reference Integrity Rule",
        "Yes, continue from the next unpresented",
        "The target phrasal verb to analyze is:"
    ];

    const MIN_HEIGHT = 200;        // messages shorter than this get no button (as in the original)
    const SCAN_DELAY = 200;        // ms: at most one scan per interval while the DOM is busy
    const SAFETY_INTERVAL = 3000;  // ms: slow safety sweep
    const SCROLL_QUIET = 180;      // ms: scans wait until scrolling has been quiet this long
    const SCROLL_MAX_DEFER = 1500; // ms: but never postpone a pending scan longer than this
    const HEAL_WINDOW = 3000;      // circuit breaker: max HEAL_MAX corrections per entry per window
    const HEAL_MAX = 6;
    const KEY_PREFIX = 'cgcm:v2:';
    const BTN_CLASS = 'cgcm-toggle-button';
    const COLLAPSED_CLASS = 'cgcm-collapsed';

    // Current layout markers. Nested matches are reduced to the outermost one.
    const MESSAGE_SELECTOR = [
        '[data-content-search-unit-key]',                     // one unit per message ("<turn>:<index>:<role>")
        '[data-user-message-bubble]',                         // user text bubble
        '[data-chatgpt-selection-message-id]',                // assistant answer body
        '[data-markdown-text-style="assistant-message"]'      // assistant markdown
    ].join(',');

    // Preferred content-only elements inside a USER message (the native action row is outside them).
    const USER_CONTENT_SELECTORS = ['.text-user-message', '[data-user-message-bubble]'];

    const BUTTON_SELECTOR = 'button, [role="button"]';

    // Controls that indicate a user message is being edited (structural: no labels, no class names).
    const EDITOR_SELECTOR = 'textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

    // element -> { id, role, root, target, anchor, button, actionsInside, heals }
    const entries = new WeakMap();

    // Single source of truth for collapsed state: message id -> boolean.
    // Entries never keep their own copy, so two entries can never disagree.
    const states = new Map();

    // ---------- Styles ----------
    const style = document.createElement('style');
    style.textContent = `
        .${COLLAPSED_CLASS} {
            position: relative !important;
            overflow: hidden !important;
            max-height: 100px !important;
            min-height: 0 !important;
        }
        .${COLLAPSED_CLASS}::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 10px;
            background: linear-gradient(to bottom, transparent, red);
            pointer-events: none;
        }
        /* A user message being edited is never clipped (applies the instant the editor appears) */
        .${COLLAPSED_CLASS}.cgcm-user:has(${EDITOR_SELECTOR}) {
            overflow: visible !important;
            max-height: none !important;
        }
        .${COLLAPSED_CLASS}.cgcm-user:has(${EDITOR_SELECTOR})::after {
            display: none;
        }
        .${BTN_CLASS} {
            display: block;
            text-align: center;
            overflow-anchor: none; /* never let the browser pick our button as its scroll anchor */
        }
    `;
    (document.head || document.documentElement).appendChild(style);

    // ---------- Helpers ----------
    function storageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    function hashString(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h + str.charCodeAt(i)) | 0;
        }
        return (h >>> 0).toString(36);
    }

    function getRole(el) {
        const unitKey = el.getAttribute('data-content-search-unit-key');
        if (unitKey) {
            const r = unitKey.split(':').pop();
            if (r && /^[a-z_]+$/i.test(r)) return r.toLowerCase();
        }
        if (el.hasAttribute('data-user-message-bubble') ||
            el.querySelector('[data-user-message-bubble]') ||
            el.closest('[data-user-message-bubble]')) return 'user';
        return 'assistant';
    }

    // An element with display: contents has no box; use its first box-generating descendant.
    function layoutBox(el) {
        let node = el;
        while (node && getComputedStyle(node).display === 'contents') {
            node = node.firstElementChild;
        }
        return node;
    }

    function isRendered(el) {
        if (!el.isConnected || el.getClientRects().length === 0) return false;
        if (typeof el.checkVisibility === 'function') {
            try { return el.checkVisibility({ checkVisibilityCSS: true }); } catch (e) { /* fall through */ }
        }
        return true;
    }

    // All message elements, outermost match only (avoids duplicate buttons from nested markers).
    function findTargets() {
        const all = document.querySelectorAll(MESSAGE_SELECTOR);
        const set = new Set(all);
        const result = [];
        all.forEach(el => {
            for (let p = el.parentElement; p; p = p.parentElement) {
                if (set.has(p)) return;
            }
            result.push(el);
        });
        return result;
    }

    // First `max` characters of visible text, without forcing a full layout/innerText.
    function leadText(el, max) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let out = '';
        while (out.length < max && walker.nextNode()) {
            out += walker.currentNode.nodeValue.replace(/\s+/g, ' ');
        }
        return out.trim().substring(0, max);
    }

    // A stable, attribute-based message id when the page provides one.
    function stableId(el) {
        let v;
        const body = el.matches('[data-chatgpt-selection-message-id]')
            ? el : el.querySelector('[data-chatgpt-selection-message-id]');
        if (body) {
            v = body.getAttribute('data-chatgpt-selection-message-id');
            if (v) return v;
        }
        const unit = el.getAttribute('data-content-search-unit-key');
        if (unit && !/fallback/i.test(unit)) return unit;
        const wrap = el.closest('[data-chatgpt-search-message-ids]');
        if (wrap) {
            v = wrap.getAttribute('data-chatgpt-search-message-ids');
            if (v) return v;
        }
        return null;
    }

    // Where to insert the button. Normally right before the message; if the message sits in a
    // row-flex/grid container that holds only this message, insert before that container instead.
    function pickAnchor(root) {
        let anchor = root;
        for (let i = 0; i < 3; i++) {
            const parent = anchor.parentElement;
            if (!parent || parent === document.body || parent.tagName === 'MAIN') break;
            const cs = getComputedStyle(parent);
            const isRowFlex = cs.display.includes('flex') && !cs.flexDirection.startsWith('column');
            const isGrid = cs.display.includes('grid');
            if (!isRowFlex && !isGrid) break;
            const hasOtherMessages = Array.from(parent.querySelectorAll(MESSAGE_SELECTOR))
                .some(x => !root.contains(x) && !x.contains(root));
            if (hasOtherMessages) break;
            anchor = parent;
        }
        return anchor;
    }

    // ---------- State (single source of truth) ----------
    const isCollapsed = entry => states.get(entry.id) === true;

    function setState(id, collapsed) {
        states.set(id, collapsed);
        storageSet(id, collapsed ? 'collapsed' : 'expanded');
    }

    // ---------- User messages: content vs. native controls vs. edit mode ----------

    // Native controls = buttons (outside code blocks). No labels or class names involved.
    const hasButtons = node => Array.from(node.querySelectorAll(BUTTON_SELECTOR)).some(b => !b.closest('pre'));

    // A user message is being edited when it contains a rendered editing control.
    const isEditing = root => Array.from(root.querySelectorAll(EDITOR_SELECTOR)).some(e => e.offsetHeight >= 16);

    // Structural fallback: descend into the child holding the most text until no buttons remain.
    function descendToContent(node) {
        while (hasButtons(node)) {
            const kid = Array.from(node.children)
                .sort((a, b) => b.textContent.length - a.textContent.length)[0];
            if (!kid) return null;
            node = kid;
        }
        return node;
    }

    // Which element gets the collapsed class. Assistant messages: the root, as before.
    function resolveTarget(root, role) {
        if (role !== 'user') return { node: root, clean: true };

        for (const sel of USER_CONTENT_SELECTORS) {
            const matches = root.matches(sel) ? [root] : root.querySelectorAll(sel);
            if (matches.length !== 1) continue;
            const node = layoutBox(matches[0]) || matches[0];
            if (!hasButtons(node)) return { node, clean: true };
        }
        const node = descendToContent(root);
        return node ? { node: layoutBox(node) || node, clean: true } : { node: root, clean: false };
    }

    function isTargetValid(entry) {
        if (!entry.target.isConnected || !entry.root.contains(entry.target)) return false;
        // Native controls rendered late inside a user target: re-resolve (once; see actionsInside)
        return !(entry.role === 'user' && !entry.actionsInside && hasButtons(entry.target));
    }

    // ---------- Buttons and state application (DOM writes) ----------
    function applyState(entry) {
        const collapsed = isCollapsed(entry);
        entry.target.classList.toggle(COLLAPSED_CLASS, collapsed);
        entry.target.classList.toggle('cgcm-user', entry.role === 'user');
        const label = collapsed ? 'Expand' : 'Collapse';
        if (entry.button.textContent !== label) entry.button.textContent = label;
    }

    function createButton(entry, isUser, isAutoCollapsed) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Collapse or Expand';
        btn.classList.add(BTN_CLASS);
        btn.style.backgroundColor = isUser ? (isAutoCollapsed ? 'green' : 'blue') : '#a30000';
        btn.style.color = '#c6cdb0';
        btn.style.border = 'none';
        btn.style.padding = '5px 10px';
        btn.style.marginBottom = '0px';
        btn.style.cursor = 'pointer';
        btn.style.width = 'stretch';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            setState(entry.id, !isCollapsed(entry));
            applyState(entry);
            scheduleScan(); // other entries sharing this id (if any) converge on the same state
        });
        return btn;
    }

    function teardown(entry) {
        entry.button.remove();
        entry.target.classList.remove(COLLAPSED_CLASS);
    }

    // Circuit breaker: a correction loop (fighting re-render, etc.) can never run away.
    function healAllowed(entry) {
        const now = Date.now();
        entry.heals = (entry.heals || []).filter(t => now - t < HEAL_WINDOW);
        if (entry.heals.length >= HEAL_MAX) return false;
        entry.heals.push(now);
        return true;
    }

    // Read phase: decide whether anything must be repaired. Returns a write thunk or null.
    function planHeal(entry) {
        if (!entry.anchor.isConnected || !entry.anchor.contains(entry.root)) {
            entry.anchor = pickAnchor(entry.root);
        }
        const parent = entry.anchor.parentElement;
        const needMove = !!parent &&
            (!entry.button.isConnected || entry.button.nextElementSibling !== entry.anchor);
        const collapsed = isCollapsed(entry);
        const label = collapsed ? 'Expand' : 'Collapse';
        const needState = entry.target.classList.contains(COLLAPSED_CLASS) !== collapsed ||
            entry.button.textContent !== label;
        if (!needMove && !needState) return null;
        if (!healAllowed(entry)) return null;
        return () => {
            if (needMove) parent.insertBefore(entry.button, entry.anchor);
            if (needState) applyState(entry);
        };
    }

    // ---------- Core (read phase; DOM writes are queued in `writes`) ----------
    function processElement(el, root, role, id, live, writes) {
        let entry = entries.get(el);

        // User message being edited: change nothing (the CSS above keeps the editor unclipped)
        // and keep our button/class alive so cleanup does not strip them.
        if (role === 'user' && isEditing(root)) {
            if (entry) {
                live.buttons.add(entry.button);
                live.targets.add(entry.target);
            }
            return;
        }

        // Node reused for another message, or inner box replaced: rebuild (rare, done immediately).
        if (entry && (entry.id !== id || entry.root !== root)) {
            teardown(entry);
            entries.delete(el);
            entry = null;
        }

        if (entry) {
            // Only the content target became invalid: move to the new target in place, keep the button.
            if (!isTargetValid(entry)) {
                const resolved = resolveTarget(root, role);
                const oldTarget = entry.target;
                entry.target = resolved.node;
                entry.actionsInside = !resolved.clean;
                writes.push(() => {
                    if (oldTarget !== entry.target) oldTarget.classList.remove(COLLAPSED_CLASS);
                    applyState(entry);
                });
            }
            // Another entry already owns this target in this scan: drop this duplicate, leave the class alone.
            if (live.targets.has(entry.target)) {
                const dup = entry;
                entries.delete(el);
                writes.push(() => dup.button.remove());
                return;
            }
            const fix = planHeal(entry);
            if (fix) writes.push(fix);
            live.buttons.add(entry.button);
            live.targets.add(entry.target);
            return;
        }

        if (root.offsetHeight < MIN_HEIGHT) return; // too short or not laid out yet: retried on later scans

        const isUser = role === 'user';
        const innerText = (root.innerText || '').replace(/\u00a0/g, ' ');
        const rawText = (root.textContent || '').replace(/\u00a0/g, ' ');
        const isAutoCollapsed = isUser &&
            autoCollapsePhrases.some(p => innerText.includes(p) || rawText.includes(p));

        const anchor = pickAnchor(root);
        if (!anchor.parentElement) return;

        const resolved = resolveTarget(root, role);
        if (live.targets.has(resolved.node)) return; // target already owned by another entry

        if (!states.has(id)) {
            const stored = storageGet(id);
            states.set(id, stored === 'collapsed' || (isAutoCollapsed && stored !== 'expanded'));
        }
        entry = {
            id, role, root, anchor,
            target: resolved.node,
            actionsInside: !resolved.clean,
            button: null,
            heals: []
        };
        entry.button = createButton(entry, isUser, isAutoCollapsed);
        entries.set(el, entry);
        live.buttons.add(entry.button);
        live.targets.add(entry.target);

        const newEntry = entry;
        writes.push(() => {
            if (!newEntry.anchor.parentElement) return;
            newEntry.anchor.parentElement.insertBefore(newEntry.button, newEntry.anchor);
            applyState(newEntry);
        });
    }

    // ---------- Scroll stability ----------
    let scroller = null;

    function findScroller(from) {
        if (scroller && scroller.isConnected && from && scroller.contains(from)) return scroller;
        for (let n = from && from.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
            const oy = getComputedStyle(n).overflowY;
            if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && n.scrollHeight > n.clientHeight + 1) {
                scroller = n;
                return n;
            }
        }
        scroller = null; // do not cache the document fallback
        return document.scrollingElement || document.documentElement;
    }

    // First message that is at least partly inside the viewport, and where it is right now.
    function viewportAnchor(roots, sc) {
        const topBound = (sc === document.scrollingElement || sc === document.documentElement)
            ? 0 : sc.getBoundingClientRect().top;
        for (const el of roots) {
            const r = el.getBoundingClientRect();
            if (r.height > 0 && r.bottom > topBound + 1) return { el, top: r.top };
        }
        return null;
    }

    function scrollBy(sc, d) {
        const top = sc.scrollTop + d;
        try { sc.scrollTo({ top, behavior: 'instant' }); } catch (e) { sc.scrollTop = top; }
    }

    // ---------- Scan ----------
    function scan() {
        const live = { buttons: new Set(), targets: new Set() };
        const counts = new Map(); // occurrence counter for hash-based ids (identical repeated messages)
        const writes = [];
        const roots = [];

        // READ PHASE (no DOM writes except rare teardowns)
        findTargets().forEach(el => {
            try {
                const role = getRole(el);
                const root = layoutBox(el);
                if (!root || !isRendered(root)) return; // also skips a hidden duplicate copy of the thread
                roots.push(root);

                let base;
                const sid = stableId(el);
                if (sid) {
                    base = role + '|' + sid;
                } else {
                    base = 'h:' + hashString(location.pathname + '|' + role + '|' + leadText(root, 60));
                    const n = counts.get(base) || 0;
                    counts.set(base, n + 1);
                    base += '#' + n;
                }
                processElement(el, root, role, KEY_PREFIX + base, live, writes);
            } catch (err) {
                console.warn('[CGCM] error while processing a message', err);
            }
        });

        // Orphaned buttons / stale collapsed classes left by re-rendered nodes
        const staleButtons = Array.from(document.querySelectorAll('.' + BTN_CLASS)).filter(b => !live.buttons.has(b));
        const staleTargets = Array.from(document.querySelectorAll('.' + COLLAPSED_CLASS)).filter(t => !live.targets.has(t));

        if (!writes.length && !staleButtons.length && !staleTargets.length) return; // nothing to change

        // Remember what the user is looking at, so changes above it cannot move it.
        let sc = null, anchorInfo = null;
        if (roots.length) {
            sc = findScroller(roots[0]);
            if (sc && sc.scrollTop > 1) anchorInfo = viewportAnchor(roots, sc);
        }

        // WRITE PHASE (one batch => at most one layout pass)
        writes.forEach(fn => { try { fn(); } catch (err) { console.warn('[CGCM] write error', err); } });
        staleButtons.forEach(b => b.remove());
        staleTargets.forEach(t => t.classList.remove(COLLAPSED_CLASS));

        // Compensate any shift that the browser's own scroll anchoring did not absorb.
        if (anchorInfo && anchorInfo.el.isConnected) {
            const d = anchorInfo.el.getBoundingClientRect().top - anchorInfo.top;
            if (Math.abs(d) >= 1) scrollBy(sc, d);
        }

        // Discard mutation records produced by this scan itself (prevents self-triggered rescans).
        observer.takeRecords();
    }

    // ---------- Scheduling ----------
    let timer = null;
    let deferredSince = 0;
    let lastScroll = 0;

    function noteScroll() { lastScroll = performance.now(); }

    function runScheduled() {
        timer = null;
        const now = performance.now();
        const quiet = now - lastScroll;
        if (quiet < SCROLL_QUIET) {
            if (!deferredSince) deferredSince = now;
            if (now - deferredSince < SCROLL_MAX_DEFER) {
                scheduleScan(SCROLL_QUIET - quiet + 20); // still scrolling: try again shortly
                return;
            }
        }
        deferredSince = 0;
        scan();
    }

    function scheduleScan(delay) {
        if (timer) return;
        timer = setTimeout(runScheduled, typeof delay === 'number' ? delay : SCAN_DELAY);
    }

    // Only real element additions/removals matter. Text-node changes (streaming text, our own
    // button label) and our own button are ignored, so the script can never retrigger itself.
    const isOwnNode = n => n.nodeType === 1 && n.classList.contains(BTN_CLASS);
    const isRelevantNode = n => n.nodeType === 1 && !isOwnNode(n);

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const n of m.addedNodes) if (isRelevantNode(n)) return scheduleScan();
            for (const n of m.removedNodes) if (isRelevantNode(n)) return scheduleScan();
        }
    });

    // ---------- Diagnostics: run cgcmDiagnose() in the DevTools console ----------
    window.cgcmDiagnose = function () {
        const probes = MESSAGE_SELECTOR.split(',').concat([
            '.text-user-message', '[data-turn-key]', '[data-testid]',
            '[data-message-author-role]', '[data-message-id]'   // legacy markers: expected to be 0
        ]);
        console.table(probes.map(sel => ({ selector: sel, count: document.querySelectorAll(sel).length })));

        const attrs = {};
        document.querySelectorAll('main *').forEach(e => {
            for (const a of e.attributes) {
                if (a.name.startsWith('data-')) attrs[a.name] = (attrs[a.name] || 0) + 1;
            }
        });
        console.log('[CGCM] data-* attributes inside <main>:');
        console.table(attrs);

        console.log('[CGCM] how user messages resolve their collapse target:');
        console.table(findTargets().filter(el => getRole(el) === 'user').slice(0, 5).map(el => {
            const root = layoutBox(el);
            if (!root) return { note: 'no layout box' };
            const r = resolveTarget(root, 'user');
            return {
                root: root.tagName + '.' + String(root.className).slice(0, 40),
                target: r.node.tagName + '.' + String(r.node.className).slice(0, 40),
                clean: r.clean,
                editing: isEditing(root)
            };
        }));

        const first = findTargets().map(layoutBox).find(Boolean);
        const sc = first ? findScroller(first) : null;
        console.log('[CGCM] scroll container:', sc,
            sc ? { scrollTop: sc.scrollTop, scrollHeight: sc.scrollHeight, clientHeight: sc.clientHeight } : '');
        console.log('[CGCM] buttons: ' + document.querySelectorAll('.' + BTN_CLASS).length +
            ', collapsed targets: ' + document.querySelectorAll('.' + COLLAPSED_CLASS).length +
            ', tracked states: ' + states.size);
    };

    function start() {
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('scroll', noteScroll, { capture: true, passive: true });
        window.addEventListener('wheel', noteScroll, { capture: true, passive: true });
        window.addEventListener('touchmove', noteScroll, { capture: true, passive: true });
        scan();
        setInterval(() => { if (!document.hidden) scheduleScan(0); }, SAFETY_INTERVAL);
        window.addEventListener('load', () => scheduleScan());
    }

    if (document.body) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();

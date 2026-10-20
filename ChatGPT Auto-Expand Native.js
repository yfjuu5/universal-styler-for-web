// ==UserScript==
// @name         ChatGPT Auto-Expand Native "Show more" (User Messages)
// @namespace    https://github.com/ChinaGodMan/UserScripts
// @version      1.0.0
// @description  Hides ChatGPT's native "Show more / Show less" button on user messages and expands the message natively, so the Collapse/Expand userscript can reveal the full text in one click.
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // Set to true ONLY if long user messages stay truncated after installing everything
    // (see section 4): then the script clicks each native button once without checking for a clamp.
    const CLICK_ON_FIRST_SIGHT = false;

    const NATIVE_BUTTON = "button[data-markdown-copy='exclude']";
    const USER = '[data-user-message-bubble], .text-user-message, [data-message-author-role="user"], [data-content-search-unit-key$=":user"]';
    const ASSISTANT = '[data-chatgpt-selection-message-id], [data-markdown-text-style="assistant-message"], [data-message-author-role="assistant"], [data-content-search-unit-key$=":assistant"]';
    const clicked = new WeakSet(); // each native button is clicked at most once

    // The nearest ancestor holding the USER message, or null if the button isn't a user-message
    // "Show more" control (icon-only action buttons, code/table controls, assistant content).
    function userMessageOf(btn) {
        if (!btn.textContent.trim() || btn.closest('pre, table')) return null;
        for (let a = btn.parentElement, i = 0; a && i < 6; a = a.parentElement, i++) {
            if (a.matches(ASSISTANT) || a.querySelector(ASSISTANT)) return null;
            if (a.matches(USER) || a.querySelector(USER)) return a;
        }
        return null;
    }

    // Is the message content currently clipped by ChatGPT's own preview limit?
    // Elements collapsed by the Collapse/Expand userscript (.cgcm-collapsed) are ignored.
    function isClamped(msg) {
        const content = msg.querySelector('.text-user-message') || msg;
        const els = [content, ...content.querySelectorAll('*')].slice(0, 100);
        for (let p = content.parentElement; p && msg.contains(p); p = p.parentElement) els.push(p);
        return els.some(el => {
            if (el.classList.contains('cgcm-collapsed') || el.matches('textarea, [contenteditable], [role="textbox"]')) return false;
            if (el.scrollHeight <= el.clientHeight + 2) return false;
            const overflow = getComputedStyle(el).overflowY;
            return overflow === 'hidden' || overflow === 'clip';
        });
    }

    function scan() {
        document.querySelectorAll(NATIVE_BUTTON).forEach(btn => {
            const msg = userMessageOf(btn);
            if (!msg) return;

            btn.style.setProperty('display', 'none', 'important'); // hidden, but still clickable by script

            if (clicked.has(btn)) return;
            const expanded = btn.getAttribute('aria-expanded');
            const needsClick = expanded === 'false' ||
                (expanded === null && (CLICK_ON_FIRST_SIGHT || isClamped(msg)));
            if (needsClick) {
                clicked.add(btn);
                btn.click(); // ChatGPT expands the message itself: no clamp remains
            }
        });
    }

    let timer = null;
    function schedule() {
        if (timer) return;
        timer = setTimeout(() => { timer = null; scan(); }, 200);
    }

    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setInterval(() => { if (!document.hidden) scan(); }, 10000);

    // Re-check right after the Collapse/Expand userscript's button is used
    document.addEventListener('click', e => {
        if (e.target.closest && e.target.closest('.cgcm-toggle-button')) setTimeout(scan, 1000);
    }, true);

    scan();
})();

// ==UserScript==
// @name ChatGPT Styler for Berry Browser
// @namespace http://yourdomain.example
// @version 1
// @description Enhanced CSS styling for Berry Browser
// @match https://chatgpt.com/*
// @run-at document-end
// ==/UserScript==
(function() {
'use strict';
// Configuration
const CONFIG = {
    STYLE_ID: 'chatgpt-enhanced-styles',
    DEBUG_MODE: false,
    RETRY_DELAY: 100,
    MAX_RETRIES: 50,
    OBSERVER_THROTTLE: 250
};
    const USER_CSS = String.raw`
    .bg-transparent > .group\/titlebar
,div.text-center.text-xs.text-pretty.text-codex-description.select-none.min-h-6.px-toolbar.pb-2
,.py-4
,#_r_13o_ .group\/titlebar
,.\[-webkit-app-region\:initial\]
,button[data-sidebar-destination='builtin:skills']
,button[data-sidebar-destination='builtin:codex']
,.mt-3
,#radix-_R_4pbn9lajemktdbntccgud5hl75_
,.isolate > .contents > .contents > div:nth-child(1)
,button[data-sidebar-destination='builtin:automations']
,.mt-1
{
    display: none !important;
}

.text-user-message {
    color: #00bdff;
    border: 1px #e10000 solid;
}
.text-start {
    text-align: center;
}
.bg-user-message {
    background-color: #000000;
}
.max-w-\(--user-chat-width\) {
    max-width: 1016px;
/*     width: 1016px; */
}
.text-size-chat {
    font-size: 19px;
}
.px-\(--thread-content-margin\) {
    padding-inline: 2px
        ;
}
.pt-3 {
    padding-top: 2px;
}
.px-3 {
    padding-inline: 3px;
}
.mb-2 {
    margin-bottom: 0;
}
:is(.\*\:text-size-chat>*) {
    font-size: 19px;
}
.RichTextInput-j_tVa5 {
    color: #d40000;
    text-align: center;
    background-color: black;
}
.font-content {
    Font-weight: 500;
}
div.group\/user-message.flex.w-full.flex-col.gap-1.items-end
{
    border: 1px #00c207 solid;
}
.pb-3 {
    padding-bottom: 0;
    border-top: 1px #cbb3b3 solid;
    justify-content: center;
}
.pb-8 {
    padding-bottom: 0px;
    border: 1px #d3c0c0 solid;
    margin: 0;
}
.Text-lIMP0_ {
    --text-base-color: #e7a900;
    text-align: center;
}
.TextBase-hXhSqg[data-d-default-strong] {
    font-weight: var(--text-base-strong-weight,var(--font-weight-semibold));
    Color: #d100e1;
}
.TextBase-hXhSqg[data-d-font-style=italic] {
    font-style: normal;
    Color: #00e511;
}
:is(.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh,.DilRenderer-tB76Jj [data-d-list-item-content])>:not([data-d-component=title])+[data-d-component=title] {
    margin-block-start: 0;
}
h1
{
    text-align: Center;
    Color: #d00000;
}
.Divider-WkGDyu {
    height: 2px;
    box-sizing: content-box;
    background-color: #09ab00;
    padding-block: 0;
}
:is(.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh,.DilRenderer-tB76Jj [data-d-list-item-content])>[data-d-component=text]+[data-d-component=text] {
    margin-block-start: 0;
}
.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh {
    text-align: Center;
}
:is(.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh,.DilRenderer-tB76Jj [data-d-list-item-content])>* {
    margin-block-start: 0;
}
.TextBase-hXhSqg {
    Font-size: 19px;
}
h2.TextBase-hXhSqg.Title-HRvkwB{
/*     text-align: Center; */
    Color: #dbcece;
}
.\[--thread-content-max-width\:var\(--thread-content-responsive-max-width\,inherit\)\] {
    --thread-content-max-width: 1030px;
    margin: 0;
}
.\[--thread-body-max-width\:calc\(var\(--thread-content-max-width\)\+var\(--thread-body-inline-padding\,0px\)\*2\)\] {
/*     --thread-body-max-width: 1000px; */
}
.MarkdownRoot-rZKhxa :is(.Paragraph-kKnbIo,.List-kOVW5V,.ListItem-ncLgmg,.Table-LqdUhs) {
    justify-items: center;
    Color: #e58200;
}
.pt-\(--thread-content-top-inset\) {
    padding-top: 4px;
}
/* .contents .flex-col {
    border: 1px #980091 solid;
} */
.pb-\(--thread-composer-bottom-inset\) {
    padding-bottom: 0;
    border: 1px #e10000 solid;
    width: 1090px;
}
.mt-1\.5 {
    margin-top: 0;
    align-self: center;
    border: 1px #5eb2ba solid;
}
.flex-row-reverse {
    align-self: center;
    border: 1px #8f8aff solid;
}
.me-1 {
    opacity: 1;
}
.turn-action-controls:where([data-codex-window-type=browser] .turn-action-controls) button:not([data-turn-action-width=content]) {
    width: calc(var(--spacing) * 9);
    border: 1px #e20000 solid;
}
.bg-primary-ghost-hover {
    border: 2px #b300e8 solid !important;
}
.ps-\[var\(--padding-row-cell-x\,var\(--padding-row-x\)\)\] {
    padding-inline-start: 0;
    border: 1px #00809d solid;
    text-align: center;
}
.ps-\[var\(--padding-row-cell-x\,var\(--padding-row-x\)\)\]:hover {
    border: 2px #00c911 solid;
}
.py-row-y {
    padding-block: 2px;
}
.z-20 > .shrink-0{
    border: 1px #9f7700 solid;
}
.leading-5 {
    Color: #e47100 !important;
    Font-size: 17px;
}
.Code-kbs71c {
    --d-code-background: color-mix(in srgb, var(--color-surface-tertiary) 82%, transparent);
    color: #00c7ff;
}
.TextBase-hXhSqg[data-d-weight=semibold]{
    Color:#00d20d;
}
`;
// State management
const state = {
    enabled: true, // Always enabled since we can't save preferences
    styleElement: null,
    observer: null,
    retryCount: 0,
    lastThrottle: 0,
    currentURL: location.href
};
// Utility functions
const utils = {
    log(message) {
        if (!CONFIG.DEBUG_MODE) return;
        console.log(`ChatGPT Styler: ${message}`);
    },
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function(...args) {
            const context = this;
            const currentTime = Date.now();
            const execute = function() {
                lastExecTime = currentTime;
                func.apply(context, args);
            };
            clearTimeout(timeoutId);
            if (currentTime - lastExecTime > delay) {
                execute();
            } else {
                timeoutId = setTimeout(execute, delay - (currentTime - lastExecTime));
            }
        };
    },
    safeCall(fn, fallback = null) {
        try {
            return fn();
        } catch (e) {
            this.log(`Error in safeCall: ${e}`);
            return fallback;
        }
    }
};
// Style management
const styleManager = {
    apply() {
        if (!state.enabled) return false;
        this.remove();
        // Direct style injection (the only method supported in Berry Browser)
        return this.injectStyleElement();
    },
    injectStyleElement() {
        return utils.safeCall(() => {
            if (!document.head) return false;
            state.styleElement = document.createElement('style');
            state.styleElement.id = CONFIG.STYLE_ID;
            state.styleElement.type = 'text/css';
            state.styleElement.textContent = USER_CSS;
            // Make it hard to remove
            state.styleElement.setAttribute('data-protected', 'true');
            document.head.appendChild(state.styleElement);
            utils.log('Styles applied via style element');
            return true;
        }, false);
    },
    remove() {
        // Remove existing style elements
        const existingStyle = document.getElementById(CONFIG.STYLE_ID);
        if (existingStyle) {
            existingStyle.remove();
        }
        state.styleElement = null;
        utils.log('Styles removed');
    },
    isApplied() {
        return !!document.getElementById(CONFIG.STYLE_ID);
    },
    forceReapply() {
        if (state.enabled && !this.isApplied()) {
            utils.log('Force reapplying styles');
            this.apply();
        }
    }
};
// Observer management
const observerManager = {
    setup() {
        this.cleanup();
        if (!state.enabled) return;
        this.createDOMObserver();
        utils.log('Observer started');
    },
    createDOMObserver() {
        const throttledReapply = utils.throttle(() => {
            styleManager.forceReapply();
        }, CONFIG.OBSERVER_THROTTLE);
        state.observer = new MutationObserver(mutations => {
            let shouldReapply = false;
            for (const mutation of mutations) {
                // Check for removed style element
                if (mutation.removedNodes.length > 0) {
                    for (const node of mutation.removedNodes) {
                        if (node.id === CONFIG.STYLE_ID) {
                            shouldReapply = true;
                            break;
                        }
                    }
                }
                // Check for added nodes that might affect styling
                if (mutation.addedNodes.length > 0 && mutation.target === document.head) {
                    shouldReapply = true;
                }
            }
            if (shouldReapply) {
                throttledReapply();
            }
        });
        state.observer.observe(document, {
            childList: true,
            subtree: true
        });
    },
    cleanup() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
        utils.log('Observer cleaned up');
    }
};
// SPA Navigation handling
const navigationManager = {
    init() {
        this.overrideHistoryMethods();
        window.addEventListener('popstate', this.handleURLChange);
        window.addEventListener('hashchange', this.handleURLChange);
    },
    overrideHistoryMethods() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            navigationManager.handleURLChange();
        };
        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            navigationManager.handleURLChange();
        };
    },
    handleURLChange: utils.throttle(() => {
        if (location.href !== state.currentURL) {
            state.currentURL = location.href;
            utils.log(`URL changed: ${state.currentURL}`);
            if (state.enabled) {
                styleManager.forceReapply();
            }
        }
    }, 300)
};
// Main initialization
const app = {
    init() {
        utils.log('Initializing ChatGPT Styler for Berry Browser');
        // Apply styles with retry mechanism
        this.applyWithRetry();
        // Setup observer
        observerManager.setup();
        // Setup event listeners and SPA handling
        this.setupEventListeners();
        navigationManager.init();
        utils.log('Initialization complete. Styles applied.');
    },
    applyWithRetry() {
        if (!state.enabled) return;
        const attempt = () => {
            if (styleManager.apply()) {
                state.retryCount = 0;
                return;
            }
            state.retryCount++;
            if (state.retryCount < CONFIG.MAX_RETRIES) {
                setTimeout(attempt, CONFIG.RETRY_DELAY);
            } else {
                utils.log('Max retries reached, giving up');
            }
        };
        attempt();
    },
    setupEventListeners() {
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && state.enabled) {
                setTimeout(() => styleManager.forceReapply(), 100);
            }
        });
        // Handle focus events
        window.addEventListener('focus', () => {
            if (state.enabled) {
                setTimeout(() => styleManager.forceReapply(), 100);
            }
        });
        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            observerManager.cleanup();
        });
    }
};
// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
})();

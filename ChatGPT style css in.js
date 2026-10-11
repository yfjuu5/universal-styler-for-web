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
/* ,.mt-auto */
,.py-4
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
.overflow-auto, .overflow-scroll, .overflow-x-auto, .overflow-y-auto, .overflow-x-scroll, .overflow-y-scroll, :where(.messaging-root) .messages-scroll {
/*     scrollbar-color: var(--color-border); */
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
/*     font-style: italic; */
    Color: #00e511;
}
:is(.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh,.DilRenderer-tB76Jj [data-d-list-item-content])>:not([data-d-component=title])+[data-d-component=title] {
    margin-block-start: 0;
}
h1 {
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
    align-items: center;
}
:is(.DilRenderer-tB76Jj.DilResponseRoot-HfQrEh,.DilRenderer-tB76Jj [data-d-list-item-content])>* {
    margin-block-start: 0;
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

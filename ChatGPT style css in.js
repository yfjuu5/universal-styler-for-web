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
.ms-auto.flex.shrink-0.items-center.gap-toolbar-action
,.touch\:p-2\.5
,.mt-auto
,.my-4
,.mb-2
,[data-testid="sidebar-item-tasks"]
,[data-testid="plugins-button"]
,[data-testid="sidebar-item-projects"]
,a[href='/codex']
,.pb-\[calc\(var\(--sidebar-section-margin-top\)-var\(--sidebar-section-first-margin-top\)\)\]
{
    display: none !important;
}
.w6asjq_TextBase {
    color: #dc8a00;
    font-size: 18px;
    text-align: center;
}
.GgxHUa_Title[data-d-size=xl]{
    color: #e22900;
}
.GgxHUa_Title[data-d-size=lg]{
    color: #e6dcd9;
}
.w6asjq_TextBase[data-d-default-strong]{
    color: #ca00eb;
}
.w6asjq_TextBase[data-d-font-style=italic] {
    font-style: normal;
    Color: #1fdb00;
}
/*----------------------------------------*/
:is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):hover, :is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):active {
    scrollbar-color: #00cf00 transparent;
}
.overflow-auto, .overflow-scroll, .overflow-x-auto, .overflow-y-auto, .overflow-x-scroll, .overflow-y-scroll, :where(.messaging-root) .messages-scroll {
    scrollbar-color: #c300ee transparent;
}
:where(.puik-root) * {
    scrollbar-color: #fff transparent;
    scrollbar-width: thin;
}
/*----------------------------------------*/
.er4J8W_Code {
    color: #00c7ff;
    font-size: 18px;
    font-weight: 600;
}
.prose :where(h1):not(:where([class~=not-prose],[class~=not-prose] *)), .prose :where(h1):not(:where(:where(.writing-block-typography) [class~=not-prose],:where(.writing-block-typography) [class~=not-prose] *)):where(.writing-block-typography,.writing-block-typography *) {
    color: #e10000;
}
.markdown-new-styling :is(.markdown h1:where(:not(.not-markdown *))), .markdown-new-styling :is(.markdown h1:where(:not(:where(.writing-block-typography) .not-markdown *))):where(.writing-block-typography,.writing-block-typography *) {
    margin-bottom: 2px;
    font-size: 22px;
    text-align: center;
}
.LR5Y_W_content :is(ul,ol):has(>li:first-child>p:first-child:dir(ltr)) {
    justify-items: center;
    Color: #00c7ff;
}
.prose :where(strong):not(:where([class~=not-prose],[class~=not-prose] *)), .prose :where(strong):not(:where(:where(.writing-block-typography) [class~=not-prose],:where(.writing-block-typography) [class~=not-prose] *)):where(.writing-block-typography,.writing-block-typography *) {
    color: #e8baff;
    font-weight: 600;
}
:is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>* {
    margin-block-start: 0;
}
:is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>:not([data-d-component=title])+[data-d-component=title] {
    margin-block-start: 0;
}
:is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>[data-d-component=text]+[data-d-component=text] {
    margin-block-start: 0;
}
:is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>[data-d-component=badge][data-pill]+[data-d-component=title], :is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>[data-d-component=title]+[data-d-component=text], :is(.fv0XaG_DilRenderer.fv0XaG_DilResponseRoot,.fv0XaG_DilRenderer [data-d-list-item-content])>:is([data-d-component=title],[data-d-component=text])+[data-d-component=list] {
    margin-block-start: 0;
}
.min-h-\[46px\] {
    min-height: 40px;
/*     align-self: center; */
    border: 1px #00b0c1 solid;
}
.justify-end {
    align-self: center;
    border: 1px #00b0c1 solid;
}
.self-end {
    align-self: center;
    text-align: center;
    border: 1px #dbc6c6 solid;
}
.user-message-bubble-color {
    background-color: black;
    color: #00bcff;
    Font-size: 19px;
    border: 1px #e10000 solid;
}
.px-4 {
    padding-inline: 0;
}
.py-2\.5 {
    padding-block: 1px;
}
.w-fit {
    width: -webkit-fill-available;
}
.max-w-\(--user-chat-width\,70\%\) {
    max-width: 100%;
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

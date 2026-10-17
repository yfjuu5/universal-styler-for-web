// ==UserScript==
// @name         ChatGPT Styler for Berry Browser updated
// @namespace    http://yourdomain.example
// @version      2
// @description  Enhanced CSS styling for Berry Browser
// @match        https://chatgpt.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    // Configuration
    const CONFIG = {
        STYLE_ID: 'chatgpt-enhanced-styles',
        DEBUG_MODE: false,
        RETRY_DELAY: 100,   // used only while waiting for <html> to exist
        MAX_RETRIES: 50
    };
    const USER_CSS = String.raw`
/* Overall scrollbar dimensions */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
/* Scrollbar track (background) */
::-webkit-scrollbar-track {
  background: #003597;
  border-radius: 9px;
}
/* Scrollbar thumb (draggable handle) */
::-webkit-scrollbar-thumb {
  background: #00af21;
}
/* Scrollbar thumb on hover / active */
::-webkit-scrollbar-thumb:hover {
  background: #cf00d9;
}
:is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):hover, :is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):active {
/*     scrollbar-color: #00cf00 transparent; */
}
.overflow-auto, .overflow-scroll, .overflow-x-auto, .overflow-y-auto, .overflow-x-scroll, .overflow-y-scroll, :where(.messaging-root) .messages-scroll {
/*     scrollbar-color: #c300ee transparent; */
}
:where(.puik-root) * {
/*     scrollbar-color: #fff transparent; */
/*     scrollbar-width: thin; */
}
/*----------------------------------------*/
.ms-auto.flex.shrink-0.items-center.gap-toolbar-action
,.-m-1
,.mt-auto
,.my-4
,.mt-1
,[data-testid="sidebar-item-tasks"]
,[data-testid="plugins-button"]
,[data-testid="sidebar-item-projects"]
,a[href='/codex']
,.pb-\[calc\(var\(--sidebar-section-margin-top\)-var\(--sidebar-section-first-margin-top\)\)\]
,.md\:bottom-\[calc\(2rem\+var\(--thread-component-gap\,0px\)\)\]
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
    align-self: center;
    border: 1px #00b0c1 solid;
    width: 210px;
}
.justify-end {
    border: 1px #00b0c1 solid;
    place-self: center;
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
.\@w-lg\/main\:\[--thread-content-max-width\:48rem\] {
    border: 1px #e10000 solid;
}
.max-w-\(--thread-content-max-width\) {
    max-width: -webkit-fill-available;
}
.S6IMGG_Divider {
    height: 2px;
    padding-block: 2px;
    background-color: #00a700;
}
.wcDTda_fallbackTextarea, .wcDTda_prosemirror-parent .ProseMirror {
    margin-top: 0;
    padding-bottom: 0;
/*     font-size: var(--text-body-regular,1rem); */
    text-align: center;
}
.text-token-text-primary {
    color: #e3d5de;
}
.bg-transparent {
    background-color: black;
}
textarea {
    text-align: center;
}
.py-3 {
    padding-block: 0;
}
.px-3 {
    padding-inline: 0;
}
.pt-2 {
    padding-top: 0;
}
.px-2 {
    padding-inline: 3px;
}
.overflow-auto>*, .overflow-scroll>*, .overflow-x-auto>*, .overflow-y-auto>* {
    scrollbar-color: auto;
}
.duration-150 {
    transition-duration: unset !important;
    border: 1px #00a2bc solid;
    Color:#de8100;
}
.duration-150:hover {
    border: 3px #bc00f3 solid;
}
.transition-opacity {
    transition-timing-function: unset;
    transition-duration: unset;
}
.__menu-item {
    padding-inline: 0;
    padding-block: 1px;
}
.gap-2\.5 {
    justify-content: center;
    Font-size: 19px;
}
.__menu-item:not(:disabled):not([data-disabled])[data-active] {
    border: 2px #44bf00 solid;
}
.mb-\(--thread-component-gap\,24px\) {
    margin-bottom: 0;
}
.gap-1\.5 {
    border: 1px #ae8383 solid;
    Color:#008eff;
}
#stage-slideover-sidebar
{
    width: 310px !important;
    border: 1px #ad00ed solid !important;
}
.w-\(--sidebar-width\) {
    width: 310px;
}
.pb-8 {
    padding-bottom: 1px;
}
.px-\(--thread-content-margin\) {
    padding-inline: 0;
}
`;
    // State
    const state = {
        styleElement: null,
        observer: null,
        retryCount: 0
    };
    const utils = {
        log(message) {
            if (!CONFIG.DEBUG_MODE) return;
            console.log(`ChatGPT Styler: ${message}`);
        }
    };
    // Style management
    //
    // The <style> element is a direct child of <html>, placed AFTER <head> and
    // <body>. In document order it therefore comes after every stylesheet the
    // page adds in <head> or <body>, including lazily loaded ones. For rules of
    // equal specificity (and equal layer status) the later one wins, so the
    // page can no longer override these rules by loading CSS after the script.
    const styleManager = {
        create() {
            const el = document.createElement('style');
            el.id = CONFIG.STYLE_ID;
            el.textContent = USER_CSS;
            state.styleElement = el;
            return el;
        },
        // Ensures the element exists, is attached, and is the LAST child of <html>.
        ensureLast() {
            const root = document.documentElement;
            if (!root) return false;
            const el = state.styleElement || this.create();
            if (root.lastElementChild !== el) {
                root.appendChild(el); // appendChild moves the node if already attached
                utils.log('Style element (re)positioned as last child of <html>');
            }
            return true;
        }
    };
    // Observer: watches ONLY direct children of <html> (no subtree), so it is
    // cheap and does not fire during chat streaming. It fires when <body> is
    // inserted by the parser, or if something is appended after / removes our element.
    const observerManager = {
        setup() {
            this.cleanup();
            const root = document.documentElement;
            if (!root) return;
            state.observer = new MutationObserver(() => {
                styleManager.ensureLast();
            });
            state.observer.observe(root, { childList: true });
            utils.log('Observer started');
        },
        cleanup() {
            if (state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
        }
    };
    // Main initialization
    const app = {
        init() {
            utils.log('Initializing ChatGPT Styler');
            this.applyWithRetry();
        },
        applyWithRetry() {
            if (styleManager.ensureLast()) {
                state.retryCount = 0;
                observerManager.setup();
                return;
            }
            state.retryCount++;
            if (state.retryCount < CONFIG.MAX_RETRIES) {
                setTimeout(() => app.applyWithRetry(), CONFIG.RETRY_DELAY);
            } else {
                utils.log('Max retries reached, giving up');
            }
        }
    };
    // Start immediately (@run-at document-start). No DOMContentLoaded wait is
    // needed: the style lives on <html>, which exists from the start.
    app.init();
})();

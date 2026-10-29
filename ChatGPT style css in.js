// ==UserScript==
// @name         ChatGPT Styler for Berry Browser updated
// @namespace    http://yourdomain.example
// @version      2
// @description  Enhanced CSS styling for Berry Browser
// @match        https://chatgpt.com/*
// @run-at       document-start
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
/*----------------------------------------*/
.bg-transparent > .group\/titlebar
,div.text-center.text-xs.text-pretty.text-codex-description.select-none.min-h-6.px-toolbar.pb-2
,.py-4
,#_r_13o_ .group\/titlebar
/* ,.\[-webkit-app-region\:initial\] */
,button[data-sidebar-destination='builtin:skills']
,button[data-sidebar-destination='builtin:codex']
,.mt-3
,.isolate > .contents > .contents > div:nth-child(1)
,button[data-sidebar-destination='builtin:automations']
,.mt-1
,#radix-_R_16atqdakrll8aqn75ccgud5hl75_
,.border-button-outline
,button[aria-label='Scroll to bottom']
,div.rounded-lg > button.no-drag
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
    max-width: fit-content;
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
    Color: #d100e1;
}
.TextBase-hXhSqg[data-d-font-style=italic] {
    font-style: normal;
    Color: #b6bcff;
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
    height: 1px;
    background-color: #09ab00;
    padding-block: 6px;
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
    Font-size: 20px;
}
h2.TextBase-hXhSqg.Title-HRvkwB{
/*     text-align: Center; */
    Color: #dbcece;
}
.\[--thread-content-max-width\:var\(--thread-content-responsive-max-width\,inherit\)\] {
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
/*     width: 1090px; */
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
    color: #00c7ff;
}
.TextBase-hXhSqg[data-d-weight=semibold]{
    Color:#d20020;
}
.ComposerModeSurface-lVLm7j {
    border: 1px #00a0cc solid;
}
/*----------------------------------------*/
:is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):hover, :is(.overflow-auto,.overflow-scroll,.overflow-x-auto,.overflow-y-auto,.overflow-x-scroll,.overflow-y-scroll,:where(.messaging-root) .messages-scroll):active {
    scrollbar-color: #00cf00 transparent;
}
.overflow-auto, .overflow-scroll, .overflow-x-auto, .overflow-y-auto, .overflow-x-scroll, .overflow-y-scroll, :where(.messaging-root) .messages-scroll {
    scrollbar-color: #c300ee transparent;
}
/*----------------------------------------*/
.px-\[var\(--thread-body-inline-padding\,var\(--padding-toolbar\)\)\] {
    padding-inline: 0;
    margin-inline: 0 !important;
}
.py-2\.5 {
    padding-block: 0;
}
.List-rH8nmc[data-d-marker-layout=native][data-d-marker=number] {
    align-items: center;
}
.MainContentFrame-sss8BP {
    margin-top: 0;
}
.List-rH8nmc[data-d-marker-layout=native][data-d-marker=bullet] {
    list-style-type: decimal;
    align-items: center;
}
.List-rH8nmc[data-d-marker-layout=native] {
    padding-inline-start: 30px;
}
.Title-HRvkwB[data-d-size=sm] {
    Color: #1cc300 !important;
}
/*----------------------------------------*/
.TextBase-qM5iDq {
    color: #de9500;
    font-size: 19px;
}
    
.Title-mwq_Iy[data-d-size=xl] {
    Color: #e10000 !important;
}
.TextBase-qM5iDq[data-d-default-strong] {
    Color: #eb2cde !important;
}
.Title-mwq_Iy[data-d-size=lg] {
    Color: #02d200 !important;
}
.Divider-__JU1b {
    background-color: #7a89ff;
    padding-block: 3px;
}
.TextBase-qM5iDq[data-d-font-style=italic] {
    font-style: normal;
    Color: #00e9ff !important;
}
.Code-mbuvRp {
    color: #e7dbdb;
    font-size: 19px;
    padding: 2px 2px;
}
.Table-FT6n8d[data-d-dividers] tr:not([data-d-component=table-row-label]) {
/*     border: 1px #15df00 solid; */
}
.Table-FT6n8d th {
    border: 1px #e10000 solid;
    justify-items: center;
}
.Table-FT6n8d[data-d-column-sizing=auto] td {
    border: 1px #15df00 solid;
    text-align: center;
}
.List-GOP23i[data-d-marker-layout=native][data-d-marker=bullet] {
    list-style-type: decimal;
    align-items: center;
}
.TextBase-qM5iDq[data-d-weight=medium] {
    Color: #c6dad7 !important;
}
.Title-mwq_Iy[data-d-size=md] {
    Color: #e10000 !important;
}
code {
    color: #e40000;
}
/*----------------------------------------*/
.ms-auto {
    margin-inline-start: 0;
}
.w-65 {
    width: 320px;
    border-right: 1px #e10000 solid;
}
.ComposerLayoutFooter-_8IVRO[data-composer-rows=responsive]>.AdaptiveFooterInput-zji599 .ComposerLayoutInput-KwIAr_[data-composer-layout=single-line][data-composer-spacing=default] {
    padding-block: 5px;
    padding-inline: 5px;
}
.Title-mwq_Iy[data-d-size=sm] {
    Color: #7cc792 !important;
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

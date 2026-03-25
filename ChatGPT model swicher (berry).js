// ==UserScript==
// @name              ChatGPT Realtime Model Switcher: 4o-mini, o4-mini, o3 and more!
// @namespace         http://tampermonkey.net/
// @version           0.54.1-berry
// @description       Allowing you to switch models during a single conversation, and highlight responses by color based on the model generating them
// @match             *://chatgpt.com/*
// @license           MIT
// @grant             unsafeWindow
// @grant             GM.getValue
// @grant             GM.setValue
// @grant             GM.deleteValue
// @grant             GM_registerMenuCommand
// @grant             GM.registerMenuCommand
// @grant             GM.unregisterMenuCommand
// @run-at            document-idle
// @icon              https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// ==/UserScript==

// ─────────────────────────────────────────────────────────────────────────────
//  COMPATIBILITY SHIM
//  Provides GM.* APIs via localStorage when running in Berry Browser (or any
//  environment that does not expose the Greasemonkey / Tampermonkey GM object).
//  Also normalises unsafeWindow → window for browsers that block unsafeWindow.
// ─────────────────────────────────────────────────────────────────────────────
(async function () {
  'use strict';

  // ── 1. unsafeWindow shim ───────────────────────────────────────────────────
  const _win = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  // ── 2. GM shim ─────────────────────────────────────────────────────────────
  //  Uses localStorage with a namespaced prefix so keys don't collide with the
  //  host page.  Values are JSON-serialised to match GM's behaviour exactly.
  const LS_PREFIX = '__gm_cmsw__';

  const _GMShim = {
    getValue: async (key, defaultValue) => {
      try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    setValue: async (key, value) => {
      try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
      } catch { /* storage full / private-mode – silently ignore */ }
    },
    deleteValue: async (key) => {
      try {
        localStorage.removeItem(LS_PREFIX + key);
      } catch { }
    },
    // Berry has no extension menu, so registerMenuCommand is a harmless no-op
    // that returns a stable numeric id so callers that store the id don't break.
    registerMenuCommand: async (_label, _callback, opts) => {
      return (opts && opts.id != null) ? opts.id : Math.floor(Math.random() * 1e9);
    },
    unregisterMenuCommand: async (_id) => { }
  };

  // Prefer the real GM when the environment provides it; fall back to the shim.
  const GMApi = (
    typeof GM !== 'undefined' &&
    typeof GM.getValue === 'function'
  ) ? GM : _GMShim;

  // ── Helper re-exported as module-level shorthand ───────────────────────────
  function injectStyle(style, isDisabled = false) {
    const styleNode = document.createElement('style');
    styleNode.type = 'text/css';
    styleNode.textContent = style;
    document.head.appendChild(styleNode);
    styleNode.disabled = isDisabled;
    return styleNode;
  }

  const PlanType = Object.freeze({
    free: 0,
    plus: 1,
    pro: 2
  });

  // ── Main class (unchanged logic; uses GMApi / _win instead of GM / unsafeWindow)
  class ModelSwitcher {
    getPlanType() {
      for (const scriptNode of document.querySelectorAll('script')) {
        let match;
        while ((match = /\\"planType\\"\s*,\s*\\"(\w+?)\\"/.exec(scriptNode.innerHTML)) !== null) {
          return match[1];
        }
      }
      return 'free';
    }

    async init() {
      this.model = await GMApi.getValue('model', 'auto');
      this.buttons = {};
      this.modelSelector = null;
      this.isMenuVisible = await GMApi.getValue('isMenuVisible', true);
      this.isMenuVisibleCommandId = null;
      this.modelHighlightStyleNode = null;
      this.isModelHighlightEnabled = await GMApi.getValue('isModelHighlightEnabled', true);
      this.isModelHighlightEnabledCommandId = null;
      this.isMenuVertical = false;
      this.conversationUrlRegex = new RegExp(/https:\/\/chatgpt\.com\/backend-api\/.*conversation/);

      const planType = PlanType[this.getPlanType()];

      const models = [
        [PlanType.pro,  "o1-pro",       "o1-pro"],
        [PlanType.plus, "o3",           "o3"],
        [PlanType.plus, "o4-mini-high", "o4-mini-high"],
        [PlanType.free, "4o-mini",      "gpt-4o-mini"],
        [PlanType.free, "4.1-mini",     "gpt-4-1-mini"],
        [PlanType.free, "gpt-4o",       "gpt-4o"],
        [PlanType.plus, "gpt-4.1",      "gpt-4-1"],
        [PlanType.plus, "gpt-4.5",      "gpt-4-5"],
        [PlanType.free, "default",      "auto"],
      ];

      this.availableModels = {};
      for (const [minimumPlan, modelName, modelValue] of models) {
        if (planType >= minimumPlan) {
          this.availableModels[modelName] = modelValue;
        }
      }
    }

    hookFetch() {
      const originalFetch = _win.fetch;   // ← uses _win instead of unsafeWindow
      _win.fetch = async (resource, config = {}) => {
        if (
          typeof resource === 'string' &&
          resource.match(this.conversationUrlRegex) &&
          config.method === 'POST' &&
          config.headers &&
          config.headers['Content-Type'] === 'application/json' &&
          config.body &&
          this.model !== 'auto'
        ) {
          const body = JSON.parse(config.body);
          body.model = this.model;
          config.body = JSON.stringify(body);
        }
        return originalFetch(resource, config);
      };
    }

    injectToggleButtonStyle() {
      let style = `
        :root { color-scheme: light dark; }
        #model-selector {
          position: fixed;           /* fixed keeps the menu visible on mobile scroll */
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: default;
          z-index: 2147483647;       /* always on top */
        }
        #model-selector.horizontal { flex-direction: row; }
        #model-selector.hidden { display: none; }
        #model-selector button {
          background: none;
          border: 1px solid light-dark(#151515, white);
          color: light-dark(#151515, white);
          padding: 1px;
          cursor: pointer;
          font-size: 0.9rem;
          user-select: none;
          /* Larger tap target on touch screens */
          min-width: 60px;
          min-height: 44px;
        }
        #model-selector button.selected { color: light-dark(white, white); }
        :root {
          --o1-pro-color: 139, 232, 27;
          --o3-color: 139, 232, 27;
          --gpt-4-1-color: 13, 121, 255;
          --gpt-4-5-color: 126, 3, 165;
          --gpt-4o-color: 114, 147, 255;
          --o4-mini-high-color: 176, 53, 0;
          --gpt-4o-jawbone-color: 201, 42, 42;
          --gpt-4o-mini-color: 67, 162, 90;
          --gpt-4-1-mini-color: 117, 166, 12;
          --auto-color: 131, 131, 139;
          --unknown-model-btn-color: 67, 162, 90;
          --unknown-model-box-shadow-color: 45, 208, 0;
        }
      `;

      for (const model of Object.values(this.availableModels)) {
        style += `
          #model-selector button.btn-${model} {
            background-color: rgb(var(--${model}-color, var(--unknown-model-btn-color)));
          }
        `;
      }

      injectStyle(style);
    }

    refreshButtons() {
      for (const [model, button] of Object.entries(this.buttons)) {
        const isSelected = model === `btn-${this.model}`;
        button.classList.toggle(model, isSelected);
        button.classList.toggle('selected', isSelected);
      }
    }

    async reloadMenuVisibleToggle() {
      this.isMenuVisibleCommandId = await GMApi.registerMenuCommand(
        `${this.isMenuVisible ? '☑︎' : '☐'} Show model selector`,
        async () => {
          this.isMenuVisible = !this.isMenuVisible;
          await GMApi.setValue('isMenuVisible', this.isMenuVisible);
          this.modelSelector.classList.toggle('hidden', !this.isMenuVisible);
          this.reloadMenuVisibleToggle();
        },
        this.isMenuVisibleCommandId ? { id: this.isMenuVisibleCommandId } : {}
      );
    }

    injectMessageModelHighlightStyle() {
      let style = `
        div[data-message-model-slug] {
          padding: 0px 2px;
          box-shadow: 0 0 3px 3px rgba(var(--unknown-model-box-shadow-color), 0.65);
        }
      `;
      for (const model of Object.values(this.availableModels)) {
        style += `
        div[data-message-model-slug="${model}"] {
          box-shadow: 0 0 3px 3px rgba(var(--${model}-color, var(--unknown-model-box-shadow-color)), 0.8);
        }
        `;
      }
      this.modelHighlightStyleNode = injectStyle(style, !this.isModelHighlightEnabled);
    }

    async reloadMessageModelHighlightToggle() {
      this.isModelHighlightEnabledCommandId = await GMApi.registerMenuCommand(
        `${this.isModelHighlightEnabled ? '☑︎' : '☐'} Show model identifier`,
        async () => {
          this.isModelHighlightEnabled = !this.isModelHighlightEnabled;
          await GMApi.setValue('isModelHighlightEnabled', this.isModelHighlightEnabled);
          this.modelHighlightStyleNode.disabled = !this.isModelHighlightEnabled;
          this.reloadMessageModelHighlightToggle();
        },
        this.isModelHighlightEnabledCommandId ? { id: this.isModelHighlightEnabledCommandId } : {}
      );
    }

    createModelSelectorMenu() {
      this.modelSelector = document.createElement('div');
      this.modelSelector.id = 'model-selector';

      for (const [modelName, modelValue] of Object.entries(this.availableModels)) {
        const button = document.createElement('button');
        button.textContent = modelName;
        button.title = modelValue;
        button.addEventListener('click', async () => {
          this.model = modelValue;
          await GMApi.setValue('model', modelValue);
          this.refreshButtons();
        });
        this.modelSelector.appendChild(button);
        this.buttons[`btn-${modelValue}`] = button;
      }

      this.modelSelector.classList.toggle('hidden', !this.isMenuVisible);
      this.modelSelector.classList.toggle('horizontal', !this.isMenuVertical);
      return this.modelSelector;
    }

    injectMenu() {
      document.body.appendChild(this.modelSelector);
    }

    monitorBodyChanges() {
      const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (document.body.querySelector('#model-selector')) continue;
          this.injectMenu();
          break;
        }
      });
      observer.observe(document.body, { childList: true });
    }

    setFixedPosition() {
      this.modelSelector.style.top       = '2px';
      this.modelSelector.style.left      = '47%';
      this.modelSelector.style.transform = 'translateX(-50%)';
    }
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  const switcher = new ModelSwitcher();
  await switcher.init();

  switcher.hookFetch();

  switcher.injectToggleButtonStyle();
  switcher.injectMessageModelHighlightStyle();

  switcher.createModelSelectorMenu();
  await switcher.reloadMenuVisibleToggle();
  await switcher.reloadMessageModelHighlightToggle();

  switcher.refreshButtons();
  switcher.monitorBodyChanges();
  switcher.injectMenu();

  switcher.setFixedPosition();
})();

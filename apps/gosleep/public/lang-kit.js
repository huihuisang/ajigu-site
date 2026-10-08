/*!
 * lang-kit — shared language switcher for ajigu sites
 * Canonical copy: ajigu-site repo. Keep synced copies in
 * snorz-site / dailyapod-site / typenote-landing.
 *
 * Usage:
 *   LangKit.mount({
 *     target: '.language-switcher',            // selector or element; existing <a data-language> links are reused
 *     current: 'zh-Hans',                       // current locale code
 *     langs: [{code,label,url}, ...],          // navigation mode: url per locale
 *     onSelect: function (code) {},            // callback mode (typenote): instead of url
 *     storageKey: 'snorz-language',            // optional persistence
 *     langParam: true                          // optional: honour ?lang= hand-off
 *   });
 */
(function (global) {
  "use strict";

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  function enhanceDetails(details) {
    // Close on outside click and Escape — <details> has no native close for these.
    document.addEventListener("click", function (e) {
      if (details.open && !details.contains(e.target)) details.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && details.open) details.open = false;
    });
  }

  function wireNavLinks(container, onSelect, storageKey) {
    container.querySelectorAll("a[data-language]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (storageKey) writeStorage(storageKey, a.dataset.language);
        if (typeof onSelect === "function") {
          e.preventDefault();
          onSelect(a.dataset.language);
        }
        // navigation mode without onSelect: let the browser follow href
      });
    });
  }

  function mount(options) {
    var opts = options || {};
    var nodes = typeof opts.target === "string"
      ? document.querySelectorAll(opts.target)
      : (opts.target ? [opts.target] : []);

    nodes.forEach(function (node) {
      var details = node.matches("details") ? node : node.querySelector("details");
      if (!details) return;
      enhanceDetails(details);

      var current = details.querySelector('[data-language][aria-current="page"], [data-lang].active, [data-lang][aria-current="page"]');
      var activeCode = opts.current || (current ? (current.dataset.language || current.dataset.lang) : null);

      if (activeCode && typeof opts.onSelect === "function") {
        // callback mode: mark the active entry
        details.querySelectorAll("[data-lang], [data-language]").forEach(function (el) {
          var code = el.dataset.lang || el.dataset.language;
          if (code === activeCode) el.setAttribute("aria-current", "page");
          else el.removeAttribute("aria-current");
        });
      }

      wireNavLinks(details, opts.onSelect, opts.storageKey);
    });

    // ?lang= hand-off: persist and jump/call once, before anything else redirects.
    if (opts.langParam) {
      var raw = new URLSearchParams(location.search).get("lang");
      if (raw) {
        var codes = (opts.langs || []).map(function (l) { return l.code; });
        var alias = { en: "en", zh: "zh-Hans", "zh-hant": "zh-Hant", ja: "ja", ko: "ko", de: "de", fr: "fr" };
        var code = codes.indexOf(raw) >= 0 ? raw : (alias[raw.toLowerCase()] || null);
        if (code && code !== opts.current) {
          if (opts.storageKey) writeStorage(opts.storageKey, code);
          var entry = (opts.langs || []).filter(function (l) { return l.code === code; })[0];
          if (typeof opts.onSelect === "function") {
            opts.onSelect(code);
          } else if (entry && entry.url !== undefined) {
            location.replace(entry.url === "" ? "/" : entry.url);
          }
        }
      }
    }

    if (opts.storageKey && opts.restore !== false && typeof opts.onSelect === "function") {
      // callback mode: restore persisted choice once on load
      var saved = readStorage(opts.storageKey);
      if (saved && saved !== opts.current && typeof opts.onSelect === "function") {
        opts.onSelect(saved);
      }
    }
  }

  global.LangKit = { mount: mount, readStorage: readStorage, writeStorage: writeStorage };
})(window);

// ---- site init (navigation mode: locale directories) ----
LangKit.mount({ target: ".language-switcher" });

// ---- site init (navigation mode: locale directories) ----
LangKit.mount({ target: ".language-switcher" });

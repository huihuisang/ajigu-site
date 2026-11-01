(() => {
  // Redirects first-time visitors from the default (English) page to their
  // browser language. Explicit choices win and persist in localStorage.
  const routes = {
    "en-GB": "",
    "zh-Hans": "zh-hans",
    ja: "ja",
    ko: "ko",
  };
  const storageKey = "moodsk-language";

  const readPreference = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const savePreference = (locale) => {
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      // Language selection still works when storage is unavailable.
    }
  };

  // Works on any host root (e.g. GitHub Pages project subpaths) by rewriting
  // the current path's locale segment instead of assuming "/".
  const localizedPath = (locale) => {
    const segments = location.pathname.split("/").filter(Boolean);
    const knownRoutes = new Set(Object.values(routes).filter(Boolean));
    if (segments.length && (knownRoutes.has(segments[segments.length - 1]) || segments[segments.length - 1] === "index.html")) {
      segments.pop();
    }
    const route = routes[locale];
    if (route) segments.push(route);
    return `/${segments.join("/")}${segments.length ? "/" : ""}`;
  };

  const browserLocale = () => {
    for (const value of navigator.languages || [navigator.language]) {
      const locale = value.toLowerCase();
      if (locale.startsWith("zh")) return "zh-Hans";
      if (locale.startsWith("ja")) return "ja";
      if (locale.startsWith("ko")) return "ko";
      if (locale.startsWith("en")) return "en-GB";
    }
    return "en-GB";
  };

  document.querySelectorAll("[data-language]").forEach((link) => {
    link.addEventListener("click", () => savePreference(link.dataset.language));
  });

  const current = document.documentElement.dataset.locale || "en-GB";

  // Explicit language hand-off from other ajigu sites via ?lang=en|zh-hans|ja|ko.
  // The parameter wins over both the stored preference and the browser language,
  // so an English ajigu.com always lands on the English Moodsk page.
  const paramAliases = { en: "en-GB", "zh-hans": "zh-Hans", zh: "zh-Hans", ja: "ja", ko: "ko" };
  const paramLang = new URLSearchParams(location.search).get("lang");
  if (paramLang) {
    const mapped = paramAliases[paramLang.toLowerCase()] || null;
    if (mapped) {
      savePreference(mapped);
      if (current === "en-GB" && mapped !== "en-GB") {
        location.replace(localizedPath(mapped));
      }
      return;
    }
  }

  if (current !== "en-GB") {
    // Non-default pages are explicit; just remember the choice.
    if (!readPreference()) savePreference(current);
    return;
  }

  const preferred = readPreference() || browserLocale();
  if (preferred !== "en-GB" && routes[preferred] !== undefined) {
    location.replace(localizedPath(preferred));
  }
})();

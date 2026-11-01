(() => {
  const routes = {
    "en-US": "",
    "en-GB": "en-gb",
    "zh-Hans": "zh-hans",
    "zh-Hant": "zh-hant",
    ja: "ja",
    ko: "ko",
    de: "de",
    fr: "fr",
  };
  const storageKey = "snorz-language";

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

  const pageName = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (Object.values(routes).includes(segments[0])) segments.shift();
    return segments[0] === "support" || segments[0] === "privacy" ? segments[0] : "";
  };

  const localizedPath = (locale) => {
    const route = routes[locale];
    const page = pageName();
    return `/${[route, page].filter(Boolean).join("/")}${route || page ? "/" : ""}${location.hash}`;
  };

  const browserLocale = () => {
    for (const value of navigator.languages || [navigator.language]) {
      const locale = value.toLowerCase();
      if (locale.startsWith("zh")) {
        return /(?:hant|tw|hk|mo)/.test(locale) ? "zh-Hant" : "zh-Hans";
      }
      if (locale.startsWith("ja")) return "ja";
      if (locale.startsWith("ko")) return "ko";
      if (locale.startsWith("de")) return "de";
      if (locale.startsWith("fr")) return "fr";
      if (/^en-(gb|au|nz|ie)/.test(locale)) return "en-GB";
      if (locale.startsWith("en")) return "en-US";
    }
    return "en-US";
  };

  document.querySelectorAll("[data-language]").forEach((link) => {
    link.addEventListener("click", () => savePreference(link.dataset.language));
  });


  const current = document.documentElement.dataset.locale || "en-US";

  // Explicit language hand-off from other ajigu sites via ?lang=en|zh|ja...
  const paramAliases = { en: "en-US", "zh-hans": "zh-Hans", "zh-hant": "zh-Hant", ja: "ja", ko: "ko", de: "de", fr: "fr" };
  const paramLang = new URLSearchParams(location.search).get("lang");
  if (paramLang) {
    const mapped = paramLang.toLowerCase().startsWith("zh") && /hant|tw|hk|mo/.test(paramLang.toLowerCase())
      ? "zh-Hant"
      : paramAliases[paramLang.toLowerCase()] || null;
    if (mapped) {
      savePreference(mapped);
      if (current === "en-US" && mapped !== "en-US" && routes[mapped] !== undefined) {
        location.replace(localizedPath(mapped));
      }
      return;
    }
  }  if (current !== "en-US") {
    if (!readPreference()) savePreference(current);
    return;
  }

  const preferred = readPreference() || browserLocale();
  if (preferred !== "en-US" && routes[preferred] !== undefined) {
    location.replace(localizedPath(preferred));
  }
})();

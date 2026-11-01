export const LANGUAGE_PREFERENCE_KEY = "ajigu-language";

export function matchLanguage(
  preferred: readonly string[],
  available: readonly string[],
): string | null {
  function parse(value: string) {
    try {
      const locale = new Intl.Locale(value.toLowerCase() === "zht" ? "zh-Hant" : value);
      return {
        tag: locale.baseName.toLowerCase(),
        language: locale.language,
        script:
          locale.script ||
          (locale.language === "zh"
            ? ["TW", "HK", "MO"].includes(locale.region || "")
              ? "Hant"
              : "Hans"
            : ""),
      };
    } catch {
      return null;
    }
  }
  const supported = available.map((code) => ({ code, locale: parse(code) }));
  for (const value of preferred) {
    const locale = parse(value);
    if (!locale) continue;
    const sameLanguage = supported.filter((entry) => entry.locale?.language === locale.language);
    const matched =
      sameLanguage.find((entry) => entry.locale?.tag === locale.tag) ||
      sameLanguage.find((entry) => entry.locale?.script === locale.script) ||
      sameLanguage[0];
    if (matched) return matched.code;
  }
  return null;
}

export function readLanguagePreference(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  } catch {
    return null;
  }
}

export function saveLanguagePreference(language: string) {
  try {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
  } catch {}
}

export function explicitLanguageHref(href: string, language: string): string {
  if (!/^en(?:-|$)/i.test(language)) return href;
  const url = new URL(href, "https://ajigu.com");
  url.searchParams.set("lang", language);
  return /^https?:\/\//.test(href) ? url.href : url.pathname + url.search + url.hash;
}

function redirectLanguage(
  routes: { code: string; href: string }[],
  preferenceKey: string,
  match: typeof matchLanguage,
) {
  try {
    const current = new URL(window.location.href);
    const initial = new URL(routes[0].href, current.origin);
    if (current.pathname !== initial.pathname) return;
    let saved = null;
    try {
      saved = window.localStorage.getItem(preferenceKey);
    } catch {}
    const available = routes.map((entry) => entry.code);
    const browserLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    const selected =
      match([current.searchParams.get("lang") || ""], available) ||
      match([saved || ""], available) ||
      match(browserLanguages, available) ||
      routes[0].code;
    const target = new URL(routes.find((entry) => entry.code === selected)!.href, current.origin);
    if (target.origin !== current.origin || target.pathname === current.pathname) return;
    target.search = current.search;
    target.hash = current.hash;
    window.location.replace(target.pathname + target.search + target.hash);
  } catch {}
}

export function languageRedirectScript(routes: readonly { code: string; href: string }[]): string {
  if (routes.length < 2) return "";
  const destinations = routes.map(({ code, href }) => {
    const url = new URL(href, "https://ajigu.com");
    return { code, href: url.pathname + url.search + url.hash };
  });
  // Both functions use only their arguments and browser globals in the early head script.
  return `(${redirectLanguage.toString()})(${JSON.stringify(destinations).replaceAll("<", "\\u003c")},${JSON.stringify(LANGUAGE_PREFERENCE_KEY)},${matchLanguage.toString()});`;
}

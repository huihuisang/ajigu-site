export const languages = ["en", "zh", "zht", "ja", "ko"] as const;
export type TypeLanguage = (typeof languages)[number];

export function normalizeLanguage(value: string | null): TypeLanguage | null {
  const normalized = value?.toLowerCase();
  const alias: Record<string, TypeLanguage> = {
    "zh-hans": "zh",
    "zh-cn": "zh",
    "zh-hant": "zht",
    "zh-tw": "zht",
  };
  if (normalized && Object.hasOwn(alias, normalized)) return alias[normalized];
  return languages.includes(normalized as TypeLanguage) ? (normalized as TypeLanguage) : null;
}
export function resolveLanguage(search: string, saved: string | null): TypeLanguage {
  return (
    normalizeLanguage(new URLSearchParams(search).get("lang")) || normalizeLanguage(saved) || "en"
  );
}
export function htmlLocale(language: TypeLanguage): string {
  return language === "zh" ? "zh-Hans" : language === "zht" ? "zh-Hant" : language;
}
export function readPreference(storage: Pick<Storage, "getItem">): string | null {
  try {
    return storage.getItem("tn-lang");
  } catch {
    return null;
  }
}
export function languageURL(url: string, language: TypeLanguage): string {
  const next = new URL(url);
  next.searchParams.set("lang", language);
  return next.href;
}

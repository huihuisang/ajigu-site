export const languages = ["en", "zh", "zht", "ja", "ko"] as const;
export type TypeLanguage = (typeof languages)[number];

export function normalizeLanguage(value: string | null): TypeLanguage | null {
  return matchLanguage(value ? [value] : [], languages) as TypeLanguage | null;
}
export function resolveLanguage(
  search: string,
  saved: string | null,
  preferred: readonly string[] = [],
): TypeLanguage {
  return (
    normalizeLanguage(new URLSearchParams(search).get("lang")) ||
    (matchLanguage([saved || ""], languages) as TypeLanguage | null) ||
    (matchLanguage(preferred, languages) as TypeLanguage | null) ||
    "en"
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
import { matchLanguage } from "@ajigu/site-kit/scripts/language";

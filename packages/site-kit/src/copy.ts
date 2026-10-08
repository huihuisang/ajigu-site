import messages from "./copy.json";

export type StudioCopy = typeof messages.en;

export function normalizeLocale(locale: string): keyof typeof messages {
  const value = locale.toLowerCase();
  if (value === "zht" || /zh-(?:hant|tw|hk)/.test(value)) return "zh-Hant";
  if (value === "zh" || value.startsWith("zh-")) return "zh-Hans";
  const language = value.split("-")[0];
  return Object.hasOwn(messages, language) ? (language as keyof typeof messages) : "en";
}

export function getCopy(locale: string): StudioCopy {
  return messages[normalizeLocale(locale)];
}

export function typeArtwork(locale: string): string {
  const language = normalizeLocale(locale);
  return language.startsWith("zh")
    ? "typenote.webp"
    : language === "ja"
      ? "typenote-ja.webp"
      : "typenote-en.webp";
}

export function formatShortText(text: string): string {
  return text
    .replace(/<br\s*\/?>|\n/gi, " ")
    .trim()
    .replace(/[.!。！]$/u, "");
}

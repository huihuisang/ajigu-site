import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveLanguage,
  htmlLocale,
  readPreference,
  languageURL,
} from "../apps/typenote/src/lib/language.ts";

test("a supported URL language wins over a saved preference", () => {
  for (const language of ["en", "zh", "zht", "ja", "ko"]) {
    assert.equal(resolveLanguage(`?lang=${language}`, "ja"), language);
  }
});
test("invalid language input cannot select a catalog prototype or hide content", () => {
  for (const value of ["__proto__", "constructor", "undefined", "xx", ""]) {
    assert.equal(resolveLanguage(`?lang=${value}`, "ja"), "ja");
    assert.equal(resolveLanguage("", value), "en");
  }
});
test("Chinese HTML language tags remain standard while query codes stay compatible", () => {
  assert.equal(htmlLocale("zh"), "zh-Hans");
  assert.equal(htmlLocale("zht"), "zh-Hant");
  assert.equal(resolveLanguage("?lang=zh-Hant", null), "zht");
});
test("a denied storage API does not block language resolution", () => {
  const storage = {
    getItem() {
      throw new DOMException("Denied", "SecurityError");
    },
  };
  assert.equal(readPreference(storage), null);
  assert.equal(resolveLanguage("?lang=ko", readPreference(storage)), "ko");
});
test("a language switch preserves the pathname, other parameters and hash", () => {
  assert.equal(
    languageURL("https://typenote.ajigu.com/?ref=studio#features", "zh"),
    "https://typenote.ajigu.com/?ref=studio&lang=zh#features",
  );
});

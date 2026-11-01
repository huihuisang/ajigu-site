import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import {
  matchLanguage,
  languageRedirectScript,
  explicitLanguageHref,
} from "../packages/site-kit/src/scripts/language.ts";
import { resolveLanguage } from "../apps/ajigu/src/products/typenote/lib/language.ts";

const supported = ["en", "zh-Hans", "zh-Hant", "ja", "ko"];
const routes = supported.map((code, index) => ({
  code,
  href: index ? `/${code.toLowerCase()}/` : "/",
}));
function redirect({
  href = "https://ajigu.com/",
  preferred = ["zh-CN"],
  saved = null,
  denied = false,
  entries = routes,
} = {}) {
  const calls = [];
  runInNewContext(languageRedirectScript(entries), {
    URL,
    navigator: { languages: preferred, language: preferred[0] },
    window: {
      location: { href, replace: (value) => calls.push(value) },
      localStorage: {
        getItem: () => {
          if (denied) throw new Error("Denied");
          return saved;
        },
      },
    },
  });
  return calls;
}

test("browser language regions and Chinese scripts match the supported catalog", () => {
  for (const [locale, expected] of [
    ["zh-CN", "zh-Hans"],
    ["zh-SG", "zh-Hans"],
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-Hant"],
    ["zh-MO", "zh-Hant"],
    ["zh-Hans-HK", "zh-Hans"],
    ["zh-Hant-CN", "zh-Hant"],
    ["ja-JP", "ja"],
    ["ko-KR", "ko"],
    ["en-AU", "en"],
  ])
    assert.equal(matchLanguage([locale], supported), expected, locale);
  assert.equal(matchLanguage(["en-GB"], ["en-US", "en-GB"]), "en-GB");
  assert.equal(matchLanguage(["en-AU"], ["en-US", "en-GB"]), "en-US");
  assert.equal(matchLanguage(["fr-FR", "ja-JP"], supported), "ja");
  assert.equal(matchLanguage(["fr-FR", "__proto__", "constructor", ""], supported), null);
});
test("automatic routing respects explicit paths, parameters and manual preferences", () => {
  assert.deepEqual(redirect(), ["/zh-hans/"]);
  assert.deepEqual(redirect({ saved: "ja", preferred: ["ko-KR"] }), ["/ja/"]);
  assert.deepEqual(redirect({ href: "https://ajigu.com/?lang=en", saved: "ja" }), []);
  assert.deepEqual(redirect({ href: "https://ajigu.com/?lang=ko", saved: "ja" }), ["/ko/?lang=ko"]);
  assert.deepEqual(redirect({ href: "https://ajigu.com/ja/?lang=ko", saved: "ko" }), []);
  assert.deepEqual(redirect({ href: "https://ajigu.com/support/" }), []);
  assert.deepEqual(redirect({ preferred: ["fr-FR"] }), []);
  assert.deepEqual(redirect({ preferred: ["en-US"] }), []);
  assert.deepEqual(redirect({ href: "https://ajigu.com/?ref=studio#apps" }), [
    "/zh-hans/?ref=studio#apps",
  ]);
});
test("denied storage and preview origins keep routing usable and on the current origin", () => {
  assert.deepEqual(redirect({ denied: true }), ["/zh-hans/"]);
  assert.deepEqual(
    redirect({
      href: "http://127.0.0.1:8772/",
      entries: routes.map((r) => ({ ...r, href: `https://ajigu.com${r.href}` })),
    }),
    ["/zh-hans/"],
  );
  assert.deepEqual(redirect({ entries: [] }), []);
});
test("English language links remain explicit without storage", () => {
  assert.equal(explicitLanguageHref("/", "en"), "/?lang=en");
  assert.equal(
    explicitLanguageHref("/gosleep/?ref=home#features", "en-US"),
    "/gosleep/?ref=home&lang=en-US#features",
  );
  assert.equal(explicitLanguageHref("/ja/", "ja"), "/ja/");
  assert.equal(explicitLanguageHref("https://ajigu.com/", "en"), "https://ajigu.com/?lang=en");
});
test("TypeNote keeps URL and saved-language precedence before browser matching", () => {
  assert.equal(resolveLanguage("", null, ["zh-HK"]), "zht");
  assert.equal(resolveLanguage("", "ja", ["zh-CN"]), "ja");
  assert.equal(resolveLanguage("?lang=en", "ja", ["ko-KR"]), "en");
  assert.equal(resolveLanguage("?lang=zh-HK", null, ["en-US"]), "zht");
  assert.equal(resolveLanguage("", "invalid", ["fr-FR", "ko-KR"]), "ko");
});

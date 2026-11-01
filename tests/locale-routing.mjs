import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run locale checks through task-artifacts.");
const evidence = path.join(output, "locale-routing");
await mkdir(evidence, { recursive: true });
const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [];
const cases = [
  { browser: "zh-CN", route: "/", target: "/zh-hans/", language: "zh-Hans" },
  { browser: "zh-TW", route: "/", target: "/zh-hant/", language: "zh-Hant" },
  { browser: "zh-HK", route: "/", target: "/zh-hant/", language: "zh-Hant" },
  { browser: "ja-JP", route: "/", target: "/ja/", language: "ja" },
  { browser: "ko-KR", route: "/", target: "/ko/", language: "ko" },
  { browser: "en-GB", route: "/", target: "/", language: "en" },
  { browser: "fr-FR", route: "/", target: "/", language: "en" },
  { browser: "fr-FR", preferred: ["fr-FR", "ja-JP"], route: "/", target: "/ja/", language: "ja" },
  { browser: "zh-CN", saved: "en", route: "/", target: "/", language: "en" },
  { browser: "zh-CN", saved: "ko", route: "/?lang=en", target: "/?lang=en", language: "en" },
  { browser: "ja-JP", saved: "ko", route: "/zh-hant/", target: "/zh-hant/", language: "zh-Hant" },
  {
    browser: "zh-CN",
    route: "/?ref=studio#apps",
    target: "/zh-hans/?ref=studio#apps",
    language: "zh-Hans",
  },
  { browser: "en-GB", route: "/gosleep/", target: "/gosleep/en-gb/", language: "en-GB" },
  { browser: "fr-FR", route: "/gosleep/", target: "/gosleep/fr/", language: "fr" },
  { browser: "ja-JP", route: "/moodsk/", target: "/moodsk/ja/", language: "ja" },
  { browser: "zh-TW", route: "/dailyapod/", target: "/dailyapod/zh-hant/", language: "zh-Hant" },
  { browser: "ko-KR", route: "/loglift/", target: "/loglift/ko/", language: "ko" },
  { browser: "ja-JP", route: "/tutu/", target: "/tutu/ja/", language: "ja" },
  { browser: "ja-JP", route: "/nameplate/about/", target: "/nameplate/about/", language: "en" },
  {
    browser: "zh-TW",
    route: "/nameplate/about/",
    target: "/nameplate/about/zh-hans/",
    language: "zh-Hans",
  },
  { browser: "zh-HK", route: "/typenote/", target: "/typenote/", language: "zh-Hant" },
  { browser: "zh-CN", route: "/typenote/?lang=en", target: "/typenote/?lang=en", language: "en" },
  {
    browser: "zh-CN",
    saved: "ko",
    legacy: "ja",
    route: "/typenote/",
    target: "/typenote/",
    language: "ko",
  },
  { browser: "zh-CN", legacy: "ja", route: "/typenote/", target: "/typenote/", language: "ja" },
  {
    browser: "zh-CN",
    saved: "fr",
    legacy: "ja",
    route: "/typenote/",
    target: "/typenote/",
    language: "ja",
  },
  { browser: "zh-CN", denied: true, route: "/", target: "/zh-hans/", language: "zh-Hans" },
];
async function createContext(options) {
  const context = await browser.newContext({ locale: options.browser, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(({ saved, legacy, preferred, denied }) => {
    if (denied)
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("Denied", "SecurityError");
        },
      });
    else {
      if (saved) localStorage.setItem("ajigu-language", saved);
      if (legacy) localStorage.setItem("tn-lang", legacy);
    }
    if (preferred) Object.defineProperty(navigator, "languages", { get: () => preferred });
  }, options);
  return { context, page };
}
async function verify(page, target, language) {
  await page.waitForFunction((expected) => document.documentElement.lang === expected, language, {
    timeout: 5000,
  });
  const actual = new URL(page.url());
  assert.equal(actual.origin, preview.origins.ajigu);
  assert.equal(actual.pathname + actual.search + actual.hash, target);
  assert.ok(await page.locator("h1").isVisible());
}
try {
  for (const entry of cases) {
    const { context, page } = await createContext(entry);
    await page.goto(preview.origins.ajigu + entry.route, { waitUntil: "networkidle" });
    await verify(page, entry.target, entry.language);
    matrix.push({ ...entry, url: page.url(), passed: true });
    await context.close();
  }
  for (const denied of [false, true]) {
    const { context, page } = await createContext({ browser: "ja-JP", denied });
    await page.goto(preview.origins.ajigu + "/", { waitUntil: "networkidle" });
    await verify(page, "/ja/", "ja");
    await page.getByRole("button", { name: "Language", exact: true }).click();
    await page.locator('[role="menuitem"][data-language="en"]').click();
    await verify(page, "/?lang=en", "en");
    if (!denied) {
      assert.equal(await page.evaluate(() => localStorage.getItem("ajigu-language")), "en");
      await page.goto(preview.origins.ajigu + "/", { waitUntil: "networkidle" });
      await verify(page, "/", "en");
      await page.getByRole("button", { name: "Language", exact: true }).click();
      await page.locator('[role="menuitem"][data-language="ja"]').click();
      await verify(page, "/ja/", "ja");
      await page.goto(preview.origins.ajigu + "/gosleep/", { waitUntil: "networkidle" });
      await verify(page, "/gosleep/ja/", "ja");
    }
    await context.close();
    matrix.push({ manualEnglish: "passed", denied });
  }
  const plain = await browser.newContext({ javaScriptEnabled: false, locale: "ja-JP" });
  const page = await plain.newPage();
  await page.goto(preview.origins.ajigu + "/");
  await verify(page, "/", "en");
  await page.locator('.language-fallback a[lang="ja"]').click();
  await verify(page, "/ja/", "ja");
  await plain.close();
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ matrix, noJavaScript: "passed", errors }, null, 2) + "\n",
  );
  console.log(
    `${matrix.length} locale scenarios passed; browser preferences, explicit routes, saved choices, denied storage and no-JavaScript navigation verified.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

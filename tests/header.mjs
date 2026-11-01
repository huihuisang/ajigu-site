import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { productPath } from "../packages/site-kit/config/urls.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run header checks through task-artifacts.");
const evidence = path.join(output, "header");
await mkdir(evidence, { recursive: true });
const home = JSON.parse(
  await readFile(new URL("../apps/ajigu/src/content/home.json", import.meta.url)),
);
const cases = home.map(({ route, locale }) => ({ route, locale }));
let fallbackLanguages;
for (const product of ["loglift", "moodsk", "gosleep", "dailyapod", "tutu"]) {
  const pages = JSON.parse(
    await readFile(
      new URL(`../apps/ajigu/src/products/${product}/content/pages.json`, import.meta.url),
    ),
  );
  if (product === "gosleep") fallbackLanguages = pages[0].languages;
  cases.push(
    ...pages.map(({ route, locale }) => ({
      route: product === "loglift" ? route : productPath(product, route),
      locale,
    })),
  );
}
for (const [code, locale] of Object.entries({
  en: "en",
  zh: "zh-Hans",
  zht: "zh-Hant",
  ja: "ja",
  ko: "ko",
})) {
  cases.push({ route: `/typenote/?lang=${code}`, locale });
}
cases.push({ route: "/nameplate/about/", locale: "en" });
cases.push({ route: "/nameplate/about/zh-hans/", locale: "zh-Hans" });
const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [];
const inspect = (page) =>
  page.locator(".studio-nav").evaluate((nav) => {
    const box = (element) => {
      const r = element.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        width: r.width,
        height: r.height,
        center: r.top + r.height / 2,
      };
    };
    const textBox = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return box(range);
    };
    const trigger = nav.querySelector(".language-switcher");
    return {
      nav: box(nav),
      trigger: trigger ? box(trigger) : null,
      language: trigger?.textContent,
      label:
        trigger && getComputedStyle(trigger.querySelector(".language-label")).display !== "none"
          ? textBox(trigger.querySelector(".language-label"))
          : null,
      links: [...nav.querySelectorAll('[data-slot="navigation-menu-link"]')].map((link) => ({
        ...box(link),
        text: textBox(link),
        decoration: getComputedStyle(link).textDecorationLine,
      })),
      fallback: [...nav.querySelectorAll(".language-fallback a")].filter(
        (e) => e.getClientRects().length,
      ).length,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
try {
  for (const entry of cases) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 960 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await page.route("**/*", async (route) => {
        if (route.request().resourceType() === "script") await gate;
        await route.continue();
      });
      try {
        await page.goto(preview.origins.ajigu + entry.route, { waitUntil: "commit" });
        await page.locator(".studio-nav").waitFor({ state: "visible" });
        await page.waitForFunction(
          () => getComputedStyle(document.querySelector(".studio-nav")).display === "flex",
        );
        await page.evaluate(() => document.fonts.ready);
        const before = await inspect(page);
        assert.ok(
          before.trigger,
          `${entry.route}@${width}: language button exists before scripts load`,
        );
        assert.equal(before.fallback, 0, "Language links do not flash before hydration");
        release();
        await page.waitForLoadState("networkidle");
        await page.getByRole("button", { name: "Language", exact: true }).click();
        await page.getByRole("menu").waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
        const after = await inspect(page);
        assert.equal(after.overflow, false);
        // TypeNote applies its query language after the English static render.
        const translated = entry.route.startsWith("/typenote/") && entry.locale !== "en";
        assert.equal(before.language !== after.language, translated);
        for (const key of translated
          ? ["right", "top", "height"]
          : ["left", "top", "width", "height"]) {
          assert.ok(
            Math.abs(before.trigger[key] - after.trigger[key]) < 1,
            `${entry.route}@${width}: stable trigger ${key}`,
          );
        }
        for (const key of ["left", "top", "width", "height"])
          assert.ok(
            Math.abs(before.nav[key] - after.nav[key]) < 1,
            `${entry.route}@${width}: stable header ${key}`,
          );
        for (const link of after.links) {
          assert.ok(Math.abs(link.center - after.trigger.center) < 1);
          assert.equal(link.decoration, "none");
          if (after.label)
            assert.ok(
              Math.abs(link.text.center - after.label.center) < 1,
              `${entry.route}@${width}: text is vertically centered`,
            );
        }
        matrix.push({ ...entry, width, before, after });
        if (entry.route === "/" || entry.route === "/gosleep/") {
          await page.locator(".studio-nav").screenshot({
            path: path.join(
              evidence,
              `header-${entry.route === "/" ? "home" : "detail"}-${width}.jpg`,
            ),
          });
        }
      } finally {
        release();
        await context.close();
      }
    }
  }
  const plain = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 960 },
  });
  const page = await plain.newPage();
  await page.goto(preview.origins.ajigu + "/gosleep/");
  assert.equal(await page.locator(".language-fallback a").count(), fallbackLanguages.length);
  for (const language of fallbackLanguages) {
    const actual = new URL(
      await page.locator(`.language-fallback a[lang="${language.code}"]`).getAttribute("href"),
      preview.origins.ajigu,
    );
    const expected = new URL(productPath("gosleep", language.href), preview.origins.ajigu);
    assert.equal(actual.pathname, expected.pathname);
    if (/^en(?:-|$)/.test(language.code))
      assert.equal(actual.searchParams.get("lang"), language.code);
  }
  for (const link of await page.locator(".language-fallback a").all())
    assert.ok(await link.isVisible());
  assert.equal(await page.locator(".language-switcher").isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('.language-fallback a[lang="ja"]').click();
  await page.waitForURL("**/gosleep/ja/");
  assert.equal(await page.locator("html").getAttribute("lang"), "ja");
  await plain.close();
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ matrix, noJavaScript: "passed", errors }, null, 2) + "\n",
  );
  console.log(
    `${matrix.length} header cases passed; pre-hydration geometry, text alignment, menus and no-JavaScript language links verified.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

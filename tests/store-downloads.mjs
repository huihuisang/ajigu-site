import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { productPath } from "../packages/site-kit/config/urls.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run store checks through task-artifacts.");
const evidence = path.join(output, "store-downloads");
await mkdir(evidence, { recursive: true });
const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [];
try {
  for (const [product, id] of [
    ["gosleep", "6799618137"],
    ["tutu", "6480340301"],
  ]) {
    const pages = JSON.parse(
      await readFile(
        new URL(`../apps/ajigu/src/products/${product}/content/pages.json`, import.meta.url),
      ),
    );
    for (const entry of pages) {
      for (const mode of [320, 1440, "no-script"]) {
        const width = mode === "no-script" ? 390 : mode;
        const context = await browser.newContext({
          viewport: { width, height: 960 },
          locale: "en-US",
          reducedMotion: "reduce",
          javaScriptEnabled: mode !== "no-script",
        });
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        const hits = [];
        await page.route("https://apps.apple.com/**", async (route) => {
          hits.push(route.request().url());
          await route.fulfill({
            status: 200,
            contentType: "text/html",
            body: "<!doctype html><title>Store destination</title>",
          });
        });
        await page.goto(preview.origins.ajigu + productPath(product, entry.route), {
          waitUntil: "networkidle",
        });
        const primary = page.locator(".product-actions a").first();
        assert.ok(await primary.isVisible());
        assert.equal(await primary.getAttribute("href"), entry.actions[0].href);
        assert.ok((await page.locator(`#download a[href*="id${id}"]`).count()) > 0);
        assert.ok(await page.locator(`#download a[href*="id${id}"]`).first().isVisible());
        assert.ok((await page.locator(`footer a[href*="id${id}"]`).count()) > 0);
        assert.equal(await page.locator('a[href*="testflight.apple.com"]').count(), 0);
        assert.doesNotMatch(
          await page.locator("body").innerText(),
          /TestFlight|free beta|测试版|測試版|ベータ|베타/i,
        );
        const geometry = await primary.evaluate((anchor) => {
          const r = anchor.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            left: r.left,
            right: r.right,
          };
        });
        assert.equal(geometry.overflow, false);
        assert.ok(geometry.left >= 0 && geometry.right <= width);
        if (entry.locale === "zh-Hans" && mode !== "no-script")
          await page.screenshot({
            path: path.join(evidence, `${product}-${width}.jpg`),
            fullPage: true,
          });
        await primary.click();
        assert.equal(hits.length, 1);
        assert.ok(new URL(hits[0]).pathname.endsWith(`/id${id}`));
        matrix.push({
          product,
          route: entry.route,
          locale: entry.locale,
          mode,
          destination: hits[0],
          passed: true,
        });
        await context.close();
      }
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify(
      { matrix, errors, storeNavigation: "intercepted; no purchase or external store page loaded" },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${matrix.length} store-download cases passed; localized hero, bottom CTA, footer, narrow screens and no-JavaScript navigation verified.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

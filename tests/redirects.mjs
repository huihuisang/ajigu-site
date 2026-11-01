import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { legacySites, origin, migrateURL } from "../packages/site-kit/config/urls.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run redirect checks through task-artifacts.");
const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true, redirects: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const results = [];
try {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      locale: "en-US",
      reducedMotion: "reduce",
    });
    await context.route(origin + "/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await context.request.get(preview.origins.ajigu + url.pathname + url.search);
      await route.fulfill({ response });
    });
    await context.addInitScript(() => localStorage.clear());
    const page = await context.newPage();
    for (const [site, legacy] of Object.entries(legacySites)) {
      const source = await readFile(
        new URL(`../apps/ajigu/public/${site}/sitemap.xml`, import.meta.url),
        "utf8",
      );
      const urls = [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
      for (const old of urls) {
        const pathname = new URL(old).pathname;
        const target = migrateURL(old, site);
        await page.goto(preview.redirectOrigins[site] + pathname, { waitUntil: "commit" });
        await page.waitForURL(target, { waitUntil: "networkidle" });
        assert.equal(await page.locator("h1").count(), 1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), target);
        results.push({ site, from: old, to: page.url(), javaScriptEnabled });
      }
      if (javaScriptEnabled) {
        const route = site === "typenote" ? "/" : "/zh-hans/";
        const query =
          site === "typenote"
            ? "?lang=zh&tag=a&tag=b&empty=&ref=a%2Fb"
            : "?tag=a&tag=b&empty=&ref=a%2Fb";
        const target = migrateURL(`https://${legacy.domain}${route}${query}#faq`, site);
        await page.goto(preview.redirectOrigins[site] + route + query + "#faq", {
          waitUntil: "commit",
        });
        await page.waitForURL(target, { waitUntil: "networkidle" });
        assert.equal(page.url(), target);
        if (site === "typenote")
          await page.waitForFunction(() => document.documentElement.lang === "zh-Hans");
        results.push({ site, queryAndHash: true, to: page.url(), javaScriptEnabled });
      }
    }
    if (javaScriptEnabled) {
      const target = origin + "/moodsk/not-a-page/?ref=a%2Fb#unknown";
      await page.goto(preview.redirectOrigins.moodsk + "/not-a-page/?ref=a%2Fb#unknown");
      await page.waitForURL(target, { waitUntil: "networkidle" });
      results.push({ site: "moodsk", unknownPath: true, to: page.url(), javaScriptEnabled });
      await page.goto(
        preview.origins.gosleep + "/support/?lang=ja&tag=a&tag=b&empty=&ref=a%2Fb#contact",
      );
      await page.waitForURL(
        preview.origins.gosleep + "/ja/support/?lang=ja&tag=a&tag=b&empty=&ref=a%2Fb#contact",
        {
          waitUntil: "networkidle",
        },
      );
      assert.equal(await page.locator("html").getAttribute("lang"), "ja");
      results.push({ site: "gosleep", legacyLanguage: true, to: page.url(), javaScriptEnabled });
    }
    await context.close();
  }
  await mkdir(path.join(output, "redirects"), { recursive: true });
  await writeFile(
    path.join(output, "redirects/results.json"),
    JSON.stringify({ results }, null, 2) + "\n",
  );
  console.log(
    `${results.length} old-domain redirects, no-script paths and query/hash cases passed.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

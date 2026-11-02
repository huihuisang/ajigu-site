import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { load } from "cheerio";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { studioPaths } from "../packages/site-kit/config/paths.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run contact checks through task-artifacts.");
const evidence = path.join(output, "contact");
await mkdir(evidence, { recursive: true });
const homes = JSON.parse(
  await readFile(new URL("../apps/ajigu/src/content/home.json", import.meta.url)),
);
const site = studioPaths("ajigu").site;
const routes = homes.map(({ route }) => `${route}contact/`);
const sitemap = await readFile(path.join(site, "sitemap.xml"), "utf8");
for (const home of homes) {
  const route = `${home.route}contact/`;
  const $home = load(await readFile(path.join(site, home.route, "index.html"), "utf8"));
  assert.equal(
    $home("header a").filter((_, link) => $home(link).attr("href") === route).length,
    1,
    `${home.route}: Contact opens its localized page`,
  );
  const $ = load(await readFile(path.join(site, route, "index.html"), "utf8"));
  assert.equal($("html").attr("lang"), home.locale);
  assert.equal($("h1").length, 1);
  assert.equal($("main").length, 1);
  assert.equal($("link[rel=canonical]").attr("href"), `https://ajigu.com${route}`);
  assert.equal($("meta[property='og:url']").attr("content"), `https://ajigu.com${route}`);
  assert.equal($("meta[property='og:title']").attr("content"), $("title").text());
  assert.deepEqual(
    $("link[hreflang]")
      .map((_, link) => $(link).attr("href"))
      .get(),
    [...routes, routes[0]].map((target) => `https://ajigu.com${target}`),
  );
  assert.ok(sitemap.includes(`<loc>https://ajigu.com${route}</loc>`));
  assert.equal($("main a[href='mailto:support@ajigu.com']").text().trim(), "support@ajigu.com");
  for (const link of home.contactLinks)
    assert.equal($("main a").filter((_, el) => $(el).attr("href") === link.href).length, 1);
}

const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [];
try {
  for (const home of homes) {
    for (const javaScriptEnabled of [true, false]) {
      for (const width of [320, 390, 1440]) {
        const context = await browser.newContext({
          locale: home.locale,
          javaScriptEnabled,
          viewport: { width, height: 960 },
          reducedMotion: "reduce",
        });
        try {
          const page = await context.newPage();
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => {
            if (message.type() === "error") errors.push(message.text());
          });
          await page.goto(preview.origins.ajigu + home.route, { waitUntil: "networkidle" });
          await page.locator(`header a[href="${home.route}contact/"]`).click();
          await page.waitForURL(`**${home.route}contact/`);
          assert.match(await page.title(), /ajigu/);
          assert.ok((await page.locator("main").innerText()).length > 100);
          assert.equal(
            await page.locator("main a[href='mailto:support@ajigu.com']").isVisible(),
            true,
          );
          assert.equal(
            await page
              .locator("header [data-slot='navigation-menu-link'][aria-current='page']")
              .getAttribute("href"),
            `${home.route}contact/`,
          );
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false,
          );
          if (javaScriptEnabled && [390, 1440].includes(width) && home.locale === "zh-Hans")
            await page.screenshot({
              path: path.join(evidence, `contact-${width}.jpg`),
              fullPage: true,
            });

          if (width === 390) {
            const next = homes[(homes.indexOf(home) + 1) % homes.length];
            if (javaScriptEnabled) {
              await page.getByRole("button", { name: "Language", exact: true }).click();
              await page.locator(`[role="menu"] a[data-language="${next.locale}"]`).click();
            } else {
              await page.locator(`.language-fallback a[lang="${next.locale}"]`).click();
            }
            await page.waitForURL((url) => url.pathname === `${next.route}contact/`);
            assert.equal(await page.locator("html").getAttribute("lang"), next.locale);
            await page.locator(`header a[href="${next.route}#apps"]`).click();
            await page.waitForURL((url) => url.pathname === next.route && url.hash === "#apps");
            assert.equal(await page.locator("#apps").isVisible(), true);
          }
          matrix.push({ locale: home.locale, width, javaScriptEnabled, status: "passed" });
        } finally {
          await context.close();
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ matrix, errors }, null, 2) + "\n",
  );
  console.log(
    `${matrix.length} contact cases passed; navigation, channels, language switching and no-script links verified.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

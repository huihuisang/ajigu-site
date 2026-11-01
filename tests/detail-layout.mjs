import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { sites } from "../packages/site-kit/config/paths.mjs";
import { inspectMoodskChapters } from "./moodsk-layout.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run layout checks through task-artifacts.");
const evidence = path.join(output, "layout");
await mkdir(evidence, { recursive: true });
const preview = await startPreview({
  ports: Object.fromEntries(Object.keys(sites).map((site) => [site, 0])),
  quiet: true,
});
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const cases = [
  { site: "ajigu", route: "/nameplate/about/", language: "en" },
  { site: "ajigu", route: "/nameplate/about/zh-hans/", language: "zh-Hans" },
  ...JSON.parse(
    await readFile(
      new URL("../apps/ajigu/src/products/loglift/content/pages.json", import.meta.url),
      "utf8",
    ),
  ).map(({ route, locale }) => ({ site: "ajigu", route, language: locale })),
  ...Object.entries({ en: "en", zh: "zh-Hans", zht: "zh-Hant", ja: "ja", ko: "ko" }).map(
    ([code, language]) => ({ site: "typenote", route: `/?lang=${code}`, language }),
  ),
];
for (const site of ["moodsk", "tutu", "gosleep", "dailyapod"]) {
  const pages = JSON.parse(
    await readFile(
      new URL(`../apps/ajigu/src/products/${site}/content/pages.json`, import.meta.url),
      "utf8",
    ),
  );
  cases.push(...pages.map(({ route, locale }) => ({ site, route, language: locale })));
}
const matrix = [],
  expanded = [],
  fallback = [],
  errors = [];
function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1, `${label}: ${actual} versus ${expected}`);
}
async function inspect(page, entry, width) {
  const metrics = await page.evaluate(() => {
    const box = (el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    };
    const children = (el) =>
      [...el.children].flatMap((child) =>
        getComputedStyle(child).display === "contents"
          ? children(child)
          : child.getClientRects().length
            ? [child]
            : [],
      );
    const modules = [...document.querySelectorAll("main .studio-shell")]
      .filter((el) => !el.parentElement.closest(".studio-shell"))
      .map((el) => ({
        id: el.id || el.className,
        ...box(el),
        contentGaps: [el, ...el.querySelectorAll(".content-section,.demo-content")]
          .filter((root) => root.matches(".content-section,.studio-demo,.demo-content"))
          .flatMap((root) =>
            children(root)
              .slice(1)
              .map((child, i) => box(child).top - box(children(root)[i]).bottom),
          ),
        headings: [...el.querySelectorAll("h2")]
          .filter(
            (h) => h.closest(".content-section,.studio-demo") === el && !h.closest(".demo-surface"),
          )
          .map((h) => ({
            ...box(h),
            nextTop: children(h.parentElement)[
              children(h.parentElement).indexOf(h) + 1
            ]?.getBoundingClientRect().top,
          })),
      }));
    return {
      modules,
      footer: box(document.querySelector(".footer-inner")),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.ok(metrics.modules.length >= 4, `${entry.site}${entry.route}: missing modules`);
  assert.equal(metrics.overflow, false, `${entry.site}${entry.route}@${width}: overflow`);
  const left = Math.max(width <= 760 ? 16 : 24, (width - 1080) / 2);
  const gap = width <= 760 ? 72 : Math.min(136, Math.max(88, width * 0.09));
  for (const [index, module] of metrics.modules.entries()) {
    const label = `${entry.site}${entry.route}@${width}/${module.id}`;
    near(module.left, left, `${label} left`);
    near(module.right, width - left, `${label} right`);
    if (index) near(module.top - metrics.modules[index - 1].bottom, gap, `${label} gap`);
    for (const spacing of module.contentGaps) near(spacing, 24, `${label} content gap`);
    for (const heading of module.headings) {
      if (module.id === "download") {
        near((heading.left + heading.right) / 2, width / 2, `${label} heading center`);
      } else {
        near(heading.left, left, `${label} heading left`);
      }
      if (heading.nextTop !== undefined)
        near(heading.nextTop - heading.bottom, 24, `${label} heading gap`);
    }
  }
  near(metrics.footer.left, left, "footer left");
  near(metrics.footer.right, width - left, "footer right");
  near(metrics.footer.top - metrics.modules.at(-1).bottom, gap, "footer gap");
  return metrics;
}
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  for (const entry of cases) {
    for (const width of [1440, 1024, 768, 640, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(preview.origins[entry.site] + entry.route, { waitUntil: "networkidle" });
      await page.waitForFunction(
        (language) => document.documentElement.lang === language,
        entry.language,
      );
      await page.locator('#faq [data-slot="accordion-trigger"]').first().waitFor();
      matrix.push({ ...entry, width, ...(await inspect(page, entry, width)) });
      if (entry.site === "moodsk") await inspectMoodskChapters(page, `${entry.route}@${width}`);
      if (width !== 1440 && width !== 320) continue;
      const triggers = page.locator('.product-details [data-slot="accordion-trigger"]');
      for (let i = 0; i < (await triggers.count()); i++) {
        await triggers.nth(i).click();
        const bounds = await page
          .locator('.product-details [data-slot="accordion-item"][data-state="open"]')
          .evaluate((el) => {
            const outer = el.getBoundingClientRect();
            const content = el.querySelector(".content-section").getBoundingClientRect();
            return {
              left: content.left,
              right: content.right,
              outerLeft: outer.left,
              outerRight: outer.right,
            };
          });
        const inset = width <= 640 ? 17 : 25;
        near(bounds.left, bounds.outerLeft + inset, "expanded content left");
        near(bounds.right, bounds.outerRight - inset, "expanded content right");
        await inspect(page, entry, width);
        expanded.push({ ...entry, width, chapter: i, ...bounds });
        await triggers.nth(i).click();
      }
      const faq = page.locator('#faq [data-slot="accordion-trigger"]').first();
      await faq.focus();
      await page.keyboard.press("Enter");
      assert.equal(await faq.getAttribute("aria-expanded"), "false");
      await page.keyboard.press("Enter");
      assert.equal(await faq.getAttribute("aria-expanded"), "true");
    }
  }
  await context.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const pagePlain = await plain.newPage();
  for (const entry of cases.filter((entry) => /^en(?:-|$)/.test(entry.language))) {
    for (const width of [1440, 320]) {
      await pagePlain.setViewportSize({ width, height: 960 });
      await pagePlain.goto(preview.origins[entry.site] + entry.route, { waitUntil: "networkidle" });
      fallback.push({ ...entry, width, ...(await inspect(pagePlain, entry, width)) });
      assert.ok(await pagePlain.locator(".faq-static article").count());
    }
  }
  await plain.close();
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ matrix, expanded, fallback, errors }, null, 2) + "\n",
  );
  console.log(
    `${matrix.length} localized layouts, ${expanded.length} expanded chapters and ${fallback.length} no-script layouts passed.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

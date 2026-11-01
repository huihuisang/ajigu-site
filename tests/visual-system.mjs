import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run visual checks through task-artifacts.");
const evidence = path.join(output, "visual-system");
await mkdir(evidence, { recursive: true });
const pages = JSON.parse(
  await readFile(new URL("../apps/ajigu/src/content/home.json", import.meta.url), "utf8"),
);
const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [],
  fonts = [];
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.request().resourceType() === "font")
      fonts.push({ url: response.url(), status: response.status() });
  });
  for (const entry of pages) {
    for (const width of [320, 390, 620, 760, 761, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(preview.origins.ajigu + entry.route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const box = (e) => {
          const r = e.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        const style = (e) => {
          const s = getComputedStyle(e);
          return {
            font: s.fontFamily,
            size: s.fontSize,
            color: s.color,
            radius: s.borderRadius,
            corner: s.getPropertyValue("corner-shape"),
          };
        };
        const grid = document.querySelector(".work-gallery"),
          nav = document.querySelector(".studio-nav");
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
          gap: parseFloat(getComputedStyle(grid).gap),
          grid: box(grid),
          nav: box(nav),
          navPadding: getComputedStyle(nav).paddingInlineStart,
          headline: document.querySelector("h1").textContent.replace(/\s+/g, " ").trim(),
          title: style(document.querySelector("h1")),
          emphasis: style(
            document.querySelector("h1 .display-emphasis") || document.querySelector("h1"),
          ),
          body: style(document.querySelector(".gallery-intro p")),
          background: getComputedStyle(document.body).backgroundColor,
          controls: [...nav.querySelectorAll("a, button")]
            .filter((e) => e.getClientRects().length)
            .map(box),
          cards: [...document.querySelectorAll(".gallery-card")].map((card) => ({
            ...box(card),
            ...style(card),
            stage: box(card.querySelector(".gallery-stage")),
            stageBackground: getComputedStyle(card.querySelector(".gallery-stage")).backgroundColor,
            image: box(card.querySelector(".gallery-mockup")),
            imageLoaded: card.querySelector("img").naturalWidth > 0,
            icon: box(card.querySelector(".app-icon")),
            summary: box(card.querySelector(".gallery-summary")),
            name: box(card.querySelector('[data-slot="card-title"]')),
            metadata: box(card.querySelector(".gallery-meta")),
            description: box(card.querySelector('[data-slot="card-description"]')),
            release: box(card.querySelector(".gallery-release")),
          })),
        };
      });
      assert.equal(result.overflow, false, `${entry.locale}@${width}: page overflow`);
      assert.equal(result.columns, width > 760 ? 2 : 1);
      assert.equal(result.gap, width > 760 ? 16 : 12);
      assert.equal(result.background, "rgb(255, 255, 255)");
      assert.equal(result.headline, entry.headline);
      assert.match(result.body.font, /Open Sans Variable/);
      assert.match(result.title.font, entry.locale === "en" ? /EB Garamond/ : /Open Sans Variable/);
      if (entry.locale === "en") assert.match(result.emphasis.font, /Cormorant Garamond/);
      const gutter = width <= 760 ? 16 : Math.max(24, (width - 1360) / 2);
      assert.ok(Math.abs(result.grid.left - gutter) < 1, `${entry.locale}@${width}: grid gutter`);
      assert.ok(result.nav.width <= 900 && result.nav.left >= 15);
      assert.equal(result.navPadding, width <= 640 ? "12px" : "20px");
      for (const control of result.controls) {
        assert.ok(
          control.left >= result.nav.left && control.right <= result.nav.right,
          `${entry.locale}@${width}: navigation clipping`,
        );
      }
      for (const card of result.cards) {
        assert.equal(card.radius, width <= 620 ? "24px" : "28px");
        assert.ok(card.imageLoaded);
        assert.equal(card.stageBackground, "rgba(0, 0, 0, 0)");
        assert.equal(card.icon.width, 64, `${entry.locale}@${width}: app icon size`);
        assert.equal(card.icon.height, 64);
        assert.ok(Math.abs(card.name.left - card.icon.right - 16) < 1);
        assert.ok(Math.abs(card.metadata.left - card.name.left) < 1);
        assert.ok(Math.abs(card.metadata.top - card.name.bottom - 8) < 1);
        assert.ok(Math.abs(card.description.top - card.summary.bottom - 16) < 1);
        assert.ok(Math.abs(card.description.left - card.summary.left) < 1);
        assert.ok(card.release.top >= card.description.bottom + 15);
        for (const content of [card.name, card.metadata, card.description, card.release]) {
          assert.ok(content.left >= card.left && content.right <= card.right);
          assert.ok(content.top >= card.top && content.bottom <= card.bottom);
        }
        assert.ok(
          Math.abs(card.image.width - card.stage.width) < 1 &&
            Math.abs(card.image.height - card.stage.height) < 1,
          `${entry.locale}@${width}: media stays inside its frame`,
        );
      }
      if (width > 760) assert.ok(Math.abs(result.cards[0].width - result.grid.width) < 1);
      matrix.push({ locale: entry.locale, width, ...result });
      if ([390, 1440].includes(width) && ["en", "zh-Hans"].includes(entry.locale)) {
        await page.screenshot({
          path: path.join(evidence, `home-${entry.locale}-${width}.jpg`),
          fullPage: true,
        });
        await page.locator('[data-product-id="gosleep"] .gallery-caption').screenshot({
          path: path.join(evidence, `caption-${entry.locale}-${width}.jpg`),
        });
      }
    }
  }
  await page.goto(preview.origins.typenote + "/?lang=en", { waitUntil: "networkidle" });
  await page.waitForFunction(() => !document.querySelector('[data-note="3"]').disabled);
  const playingStyle = await page.locator('[data-note="3"]').evaluate(
    (button) =>
      new Promise((resolve) => {
        const initial = getComputedStyle(button).backgroundColor;
        const observer = new MutationObserver(() => {
          if (!button.classList.contains("is-playing")) return;
          const style = getComputedStyle(button);
          observer.disconnect();
          resolve({ initial, playing: style.backgroundColor, shadow: style.boxShadow });
        });
        observer.observe(button, { attributes: true, attributeFilter: ["class"] });
        button.click();
      }),
  );
  assert.notEqual(
    playingStyle.playing,
    playingStyle.initial,
    "Playing key retains its visual feedback",
  );
  assert.match(playingStyle.shadow, /inset/);
  assert.ok(fonts.length > 0);
  for (const font of fonts) {
    assert.equal(new URL(font.url).origin, preview.origins.ajigu, "Font is self-hosted");
    assert.equal(font.status, 200);
    assert.match(new URL(font.url).pathname, /\.woff2$/);
  }
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ matrix, fonts, playingStyle, errors }, null, 2) + "\n",
  );
  console.log(
    `${matrix.length} visual-system cases passed; local fonts, type, spacing, cards and navigation verified.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

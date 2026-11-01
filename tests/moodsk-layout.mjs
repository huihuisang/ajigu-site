import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";

export async function inspectMoodskChapters(page, label) {
  await page.locator(".desktop-showcase.is-ready").waitFor();
  const chapters = page.locator(".desktop-showcase nav button");
  await chapters.first().waitFor();
  const measurements = [];
  for (let chapter = 0; chapter < 6; chapter++) {
    await chapters.nth(chapter).click();
    const metric = await page.locator(".desktop-showcase").evaluate((root) => {
      const outer = root.getBoundingClientRect();
      const box = (selector) => {
        const element = root.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top - outer.top,
          bottom: rect.bottom - outer.top,
          height: rect.height,
        };
      };
      return {
        height: outer.height,
        main: box(".showcase-main"),
        stage: box("#stage"),
        playback: box(".onboarding-controls"),
        cursor: box(".cursor-controls"),
        cursorButtons: root.querySelectorAll(".cursor-controls button").length,
        title: box("#title"),
        detail: box("#detail"),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    const baseline = measurements[0] || metric;
    for (const [name, actual, expected] of [
      ["carousel height", metric.height, baseline.height],
      ["main height", metric.main.height, baseline.main.height],
      ["playback position", metric.playback.top, baseline.playback.top],
    ]) {
      assert.ok(
        Math.abs(actual - expected) < 1,
        `${label}/${chapter}: ${name}: ${actual} vs ${expected}`,
      );
    }
    assert.equal(metric.overflow, false, `${label}/${chapter}: horizontal overflow`);
    assert.ok(
      metric.title.top >= 0 && metric.detail.bottom <= metric.playback.top,
      `${label}/${chapter}: copy clipped`,
    );
    assert.ok(
      Math.abs(metric.playback.bottom - metric.height) < 1,
      `${label}/${chapter}: footer is not at the bottom`,
    );
    assert.ok(metric.main.height <= 600, `${label}/${chapter}: oversized main area`);
    assert.equal(Boolean(metric.cursor), chapter === 3, `${label}/${chapter}: cursor controls`);
    assert.equal(
      metric.cursorButtons,
      chapter === 3 ? 3 : 0,
      `${label}/${chapter}: effect choices without colour controls`,
    );
    if (metric.cursor)
      assert.ok(
        metric.cursor.bottom <= metric.main.bottom,
        `${label}/${chapter}: cursor controls outside main area`,
      );
    measurements.push(metric);
  }
  await chapters.first().click();
  return measurements;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const output = process.env.TASK_ARTIFACT_DIR;
  if (!output) throw new Error("Run Moodsk layout checks through task-artifacts.");
  const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
  const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
  const matrix = [];
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const route of ["/", "/zh-hans/", "/ja/", "/ko/"]) {
      for (const width of [1440, 1024, 901, 900, 640, 390, 320]) {
        await page.setViewportSize({ width, height: 960 });
        await page.goto(preview.origins.moodsk + route, { waitUntil: "networkidle" });
        const chapters = await inspectMoodskChapters(page, `${route}@${width}`);
        matrix.push({ route, width, chapters });
      }
    }
    await mkdir(path.join(output, "moodsk-layout"), { recursive: true });
    await writeFile(
      path.join(output, "moodsk-layout/results.json"),
      JSON.stringify(matrix, null, 2) + "\n",
    );
    console.log(`${matrix.length * 6} Moodsk chapter layouts passed.`);
  } finally {
    await browser.close();
    await preview.close();
  }
}

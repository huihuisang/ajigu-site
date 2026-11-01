import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { sites, legacySites } from "../packages/site-kit/config/paths.mjs";
const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run design checks through task-artifacts.");
const evidence = path.join(output, "design");
await mkdir(evidence, { recursive: true });
const preview = await startPreview({
  ports: Object.fromEntries(Object.keys(sites).map((name) => [name, 0])),
  quiet: true,
});
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const errors = [],
  widths = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
    recordVideo: { dir: evidence, size: { width: 1200, height: 900 } },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(preview.origins.ajigu + "/zh-hans/", { waitUntil: "networkidle" });
  for (const width of [320, 360, 640, 687, 688, 1011, 1012, 1335, 1336, 1384, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const metric = await page.locator(".work-gallery").evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      columns: getComputedStyle(el).gridTemplateColumns.split(" ").length,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    assert.equal(metric.overflow, false);
    assert.ok(metric.width <= 1360);
    assert.equal(metric.columns, width > 760 ? 2 : 1);
    widths.push({ viewport: width, ...metric });
  }
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(preview.origins.tutu + "/", { waitUntil: "networkidle" });
  // The translated name is verified independently of the visual comparison.
  assert.ok(await page.locator('[role="slider"]').getAttribute("aria-label"));
  for (let repeat = 0; repeat < 2; repeat++) {
    await page.locator('a[href="#how"]').first().click();
    await page.locator('#how [data-slot="accordion-trigger"]').waitFor();
    assert.equal(
      await page.locator('#how [data-slot="accordion-trigger"]').getAttribute("aria-expanded"),
      "true",
    );
    await page.locator('#how [data-slot="accordion-trigger"]').click();
    assert.equal(
      await page.locator('#how [data-slot="accordion-trigger"]').getAttribute("aria-expanded"),
      "false",
    );
  }
  await page.goto(preview.origins.tutu + "/#%", { waitUntil: "networkidle" });
  await page.goto(preview.origins.dailyapod + "/", { waitUntil: "networkidle" });
  await page.locator('a[href="#gallery"]').first().click();
  assert.ok(await page.locator("#gallery [data-gallery-demo]").isVisible());
  await page.goto(preview.origins.moodsk + "/zh-hans/", { waitUntil: "networkidle" });
  const stage = page.locator(".moodsk-onboarding");
  await stage.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".moodsk-onboarding").dataset.active === "true",
  );
  await page.waitForTimeout(1600);
  await page.locator("#pause").click();
  for (let i = 0; i < 6; i++) {
    await page.locator(".moodsk-onboarding nav button").nth(i).click();
    assert.equal(
      await page.locator(".moodsk-onboarding nav button").nth(i).getAttribute("aria-current"),
      "step",
    );
    assert.ok((await page.locator("#title").innerText()).length > 0);
  }
  await page.locator(".moodsk-onboarding nav button").nth(3).click();
  await page.locator('[data-effect="1"]').click();
  assert.equal(await page.locator('[data-effect="1"]').getAttribute("data-state"), "on");
  assert.equal(await page.locator("[data-color]").count(), 0);
  assert.equal(await page.locator("[data-effect]").count(), 3);
  await stage.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(
    await page.locator(".moodsk-onboarding nav button").nth(2).getAttribute("aria-current"),
    "step",
  );
  await page.locator("#replay").click();
  await page.waitForTimeout(1200);
  await page.locator("footer.site-footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".moodsk-onboarding").dataset.active === "false",
  );
  await page.waitForFunction(() =>
    [...document.querySelector(".moodsk-onboarding").getAnimations({ subtree: true })].every(
      (animation) => animation.playState !== "running",
    ),
  );
  assert.equal(
    await stage.evaluate(
      (root) =>
        root.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
    ),
    0,
  );
  await stage.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".moodsk-onboarding").dataset.active === "true",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(
    () => document.querySelector(".moodsk-onboarding").dataset.active === "false",
  );
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(
    () => document.querySelector(".moodsk-onboarding").dataset.active === "true",
  );
  const cdp = await context.newCDPSession(page);
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.25 });
  await page.locator("#replay").click();
  await page.waitForTimeout(2400);
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 });
  await page.locator(".studio-signature").click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator(".studio-signature").getAttribute("data-delight"), "idle");
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(evidence, "motion-normal-and-slow.webm"));
  const reduced = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await reduced.newPage();
  staticPage.on("pageerror", (error) => errors.push(error.message));
  await staticPage.goto(preview.origins.moodsk + "/zh-hans/", { waitUntil: "networkidle" });
  await staticPage.locator(".moodsk-onboarding nav button").nth(3).click();
  await staticPage.locator('[data-effect="1"]').click();
  assert.equal(await staticPage.locator('[data-effect="1"]').getAttribute("data-state"), "on");
  await staticPage.locator("#pause").click();
  assert.equal(await staticPage.locator(".moodsk-onboarding").getAttribute("data-active"), "false");
  assert.equal(
    await staticPage
      .locator(".moodsk-onboarding")
      .evaluate(
        (root) =>
          root.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
      ),
    0,
  );
  await reduced.close();
  const plain = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  const fallback = await plain.newPage();
  for (const site of ["ajigu", ...Object.keys(legacySites)]) {
    await fallback.goto(preview.origins[site] + "/", { waitUntil: "networkidle" });
    const overflow = await fallback.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      nodes: [...document.querySelectorAll("main *,header *")]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 6)
        .map((el) => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 80) })),
    }));
    assert.ok(
      overflow.width <= overflow.viewport,
      `${site}: no-JS overflow ${JSON.stringify(overflow)}`,
    );
    assert.ok((await fallback.locator(".language-fallback a").count()) > 1);
  }
  await plain.close();
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify(
      {
        widths,
        allSixScenes: true,
        keyboard: true,
        repeatedHash: true,
        malformedHash: true,
        realGalleryAnchor: true,
        offscreenPause: true,
        visibilityEventSimulation: true,
        noJS320: true,
        reducedMotion: true,
        recording: "motion-normal-and-slow.webm",
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "11 responsive widths, anchor navigation, six scenes, keyboard, offscreen pause, reduced motion and recording passed.",
  );
} finally {
  await browser.close();
  await preview.close();
}

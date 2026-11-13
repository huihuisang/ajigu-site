import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
import { startPreview } from "../scripts/preview-workspace.mjs";
import { checkBuild } from "../scripts/check-build.mjs";
import { sites, legacySites } from "../packages/site-kit/config/paths.mjs";

const output = process.env.TASK_ARTIFACT_DIR;
if (!output) throw new Error("Run browser checks through task-artifacts.");
const evidence = path.join(output, "browser");
await mkdir(evidence, { recursive: true });
const preview = await startPreview({
  ports: Object.fromEntries(Object.keys(sites).map((name) => [name, 0])),
  quiet: true,
});
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const matrix = [],
  errors = [],
  externalFonts = [];
const locale = { en: "en", zh: "zh-Hans", zht: "zh-Hant", ja: "ja", ko: "ko" };
const logliftPages = JSON.parse(
  await readFile(
    new URL("../apps/ajigu/src/products/loglift/content/pages.json", import.meta.url),
    "utf8",
  ),
);
const walkboxPages = JSON.parse(
  await readFile(
    new URL("../apps/ajigu/src/products/walkbox/content/pages.json", import.meta.url),
    "utf8",
  ),
);
try {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error")
      errors.push(`${message.text()} ${message.location().url || ""}`);
  });
  page.on("request", (request) => {
    if (
      /fonts\.(?:googleapis|gstatic)\.com/.test(request.url()) ||
      (request.resourceType() === "font" &&
        !Object.values(preview.origins).some((origin) => request.url().startsWith(origin)))
    )
      externalFonts.push(request.url());
  });
  const cases = [
    ...[...logliftPages, ...walkboxPages].map(({ route, locale }) => ({
      site: "ajigu",
      route,
      language: locale,
    })),
    ...[
      ["/", "en"],
      ["/zh-hans/", "zh-Hans"],
      ["/zh-hant/", "zh-Hant"],
      ["/ja/", "ja"],
      ["/ko/", "ko"],
      ["/nameplate/about/", "en"],
      ["/nameplate/about/zh-hans/", "zh-Hans"],
    ].map(([route, language]) => ({ site: "ajigu", route, language })),
    ...Object.entries(locale).map(([code, language]) => ({
      site: "typenote",
      route: `/?lang=${code}`,
      language,
    })),
  ];
  for (const site of ["moodsk", "gosleep", "dailyapod", "tutu"]) {
    const pages = JSON.parse(
      await readFile(
        new URL(`../apps/ajigu/src/products/${site}/content/pages.json`, import.meta.url),
        "utf8",
      ),
    );
    cases.push(...pages.map(({ route, locale }) => ({ site, route, language: locale })));
  }
  for (const entry of cases) {
    for (const width of [1440, 768, 390]) {
      if (process.env.STUDIO_TRACE) console.log(`Checking ${entry.site}${entry.route} @ ${width}`);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      const response = await page.goto(preview.origins[entry.site] + entry.route, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200);
      const galleryPage = (await page.locator(".studio-gallery").count()) > 0;
      await page.waitForFunction(
        (language) => document.documentElement.lang === language,
        entry.language,
      );
      const metric = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main").length,
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        language: document.documentElement.lang,
        text: document.querySelector("main").innerText.length,
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute("href").slice(1))
          .filter((id) => id && !document.getElementById(decodeURIComponent(id))),
      }));
      assert.equal(metric.h1, 1);
      assert.equal(metric.main, 1);
      assert.ok(
        metric.scroll <= width,
        `${entry.site}${entry.route}@${width}: overflow ${metric.scroll}`,
      );
      assert.ok(metric.text > (galleryPage ? 50 : 250));
      assert.deepEqual(metric.missingAnchors, []);
      assert.doesNotMatch(await page.locator("main").innerText(), /<br\s*\/?>/i);
      if (entry.route.startsWith("/loglift/")) {
        assert.match(await page.locator(".product-claim").textContent(), /Rec\.709/);
      }
      if (galleryPage) {
        assert.equal(await page.locator(".work-tile").count(), 8);
        assert.deepEqual(
          await page
            .locator(".work-tile")
            .evaluateAll((tiles) => tiles.map((tile) => tile.dataset.productId)),
          ["walkbox", "loglift", "gosleep", "tutu", "moodsk", "nameplate", "typenote", "dailyapod"],
          `${entry.route}: newest availability dates first`,
        );
        const clipped = await page.locator(".gallery-card").evaluateAll((cards) =>
          cards.flatMap((card) => {
            const box = card.getBoundingClientRect();
            return [
              ...card.querySelectorAll(
                '[data-slot="card-title"],[data-slot="card-description"],.gallery-platform,.gallery-release,.gallery-pricing',
              ),
            ]
              .filter((item) => {
                const bounds = item.getBoundingClientRect();
                return bounds.bottom > box.bottom + 1 || bounds.right > box.right + 1;
              })
              .map((item) => item.textContent);
          }),
        );
        assert.deepEqual(clipped, [], `${entry.route}@${width}: clipped gallery copy`);

        assert.equal(await page.locator(".gallery-stage img").count(), 8);
        assert.deepEqual(
          await page
            .locator(".gallery-mockup")
            .evaluateAll((items) => items.map((el) => getComputedStyle(el).transform)),
          Array(8).fill("none"),
        );

        const grid = await page
          .locator(".work-gallery")
          .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
        assert.equal(grid, width > 760 ? 2 : 1);
        assert.equal(await page.locator(".gallery-release time").count(), 7);
        assert.equal(await page.locator(".gallery-pricing").count(), 7);
        assert.equal(await page.locator(".gallery-summary .gallery-platform").count(), 8);
        assert.equal(await page.locator(".gallery-summary .gallery-pricing").count(), 7);
        assert.equal(
          await page
            .locator(".gallery-details .gallery-platform,.gallery-details .gallery-pricing")
            .count(),
          0,
        );
        const positions = await page.locator(".gallery-card").evaluateAll((cards) =>
          cards.map((card) => {
            const box = card.getBoundingClientRect();
            const bounds = (selector) => card.querySelector(selector).getBoundingClientRect();
            return {
              row: Math.round(box.top),
              bottom: box.bottom,
              width: box.width,
              descriptionGap:
                bounds('[data-slot="card-description"]').top - bounds(".gallery-summary").bottom,
              metadataGap: bounds(".gallery-meta").top - bounds('[data-slot="card-title"]').bottom,
              footerBottom: bounds(".gallery-details").bottom,
              title: card.querySelector('[data-slot="card-title"]').textContent,
            };
          }),
        );
        for (const [index, position] of positions.entries()) {
          assert.ok(
            Math.abs(position.descriptionGap - 16) < 1,
            `${entry.route}@${width}: description spacing`,
          );
          assert.ok(
            Math.abs(position.metadataGap - 8) < 1,
            `${entry.route}@${width}: metadata spacing`,
          );
          assert.ok(
            position.footerBottom <= position.bottom,
            `${entry.route}@${width}: footer clipping`,
          );
          const row = positions.filter(({ row }) => row === position.row);
          for (const sibling of row)
            assert.ok(
              Math.abs(sibling.bottom - position.bottom) < 1,
              `${entry.route}@${width}: card row alignment`,
            );
          if (index === 0 && width > 760) {
            assert.ok(
              position.width > positions[1].width * 1.9,
              `${entry.route}@${width}: lead card spans both columns`,
            );
          }
        }
      }
      if (entry.site !== "moodsk" && !galleryPage) {
        const mockup = page.locator(".product-art img");
        assert.equal(await mockup.count(), 1);
        assert.ok(await mockup.evaluate((img) => img.naturalWidth > 0));
      }
      const icons = await page.locator(".app-icon").evaluateAll((elements) =>
        elements.map((el) => {
          const style = getComputedStyle(el);
          return {
            width: parseFloat(style.width),
            height: parseFloat(style.height),
            radius: style.borderRadius,
            shadow: style.boxShadow,
            loaded: el.querySelector("img").naturalWidth > 0,
          };
        }),
      );
      assert.ok(icons.length > 0);
      for (const icon of icons) {
        assert.equal(icon.width, icon.height);
        assert.equal(icon.width, galleryPage ? 64 : 72);
        assert.equal(icon.radius, "22%");
        assert.notEqual(icon.shadow, "none");
        assert.equal(icon.loaded, true);
      }
      if (entry.route.includes("/nameplate/about/")) {
        const cta = page.locator(".product-actions a[data-slot=button]");
        assert.equal(await cta.count(), 1);
        assert.ok(await cta.evaluate((button) => button.getBoundingClientRect().height >= 44));
      }
      assert.ok(await page.title());
      assert.equal(await page.locator("astro-dev-overlay, vite-error-overlay").count(), 0);
      if (
        [1440, 390].includes(width) &&
        (entry.language.startsWith("en") || entry.language === "zh-Hans")
      ) {
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            scrollTo({ top: y, behavior: "instant" });
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          scrollTo({ top: 0, behavior: "instant" });
          await Promise.race([
            Promise.all([...document.images].map((img) => img.decode().catch(() => {}))),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Images did not finish decoding")), 10000),
            ),
          ]);
        });
        assert.deepEqual(
          await page.evaluate(() =>
            [...document.images].filter((img) => !img.naturalWidth).map((img) => img.src),
          ),
          [],
        );
        await page.screenshot({
          path: path.join(
            evidence,
            `${entry.site}-${entry.route.replaceAll(/[^\w]/g, "-")}-${width}.png`,
          ),
          fullPage: true,
          animations: "disabled",
        });
      }
      matrix.push({ ...entry, width, ...metric });
    }
  }
  const products = ["moodsk", "gosleep", "dailyapod", "tutu"];
  for (const detail of logliftPages) {
    const homeRoute = detail.route.slice("/loglift".length);
    await page.goto(preview.origins.ajigu + homeRoute, { waitUntil: "networkidle" });
    await page.locator('[data-product-id="loglift"]').click();
    await page.waitForURL(preview.origins.ajigu + detail.route);
    assert.equal(await page.locator("html").getAttribute("lang"), detail.locale);
    assert.equal(
      await page.locator(".product-actions a").first().getAttribute("href"),
      detail.actions[0].href,
    );
    assert.equal(
      await page.locator(".loglift-preview video source").getAttribute("src"),
      "/studio/media/loglift/core-workflow.mp4",
    );
    const video = page.locator(".loglift-preview video");
    assert.equal(await video.getAttribute("autoplay"), null);
    assert.equal(await video.getAttribute("controls"), "");
    await page.waitForFunction(() => {
      const video = document.querySelector(".loglift-preview video");
      return video.readyState >= 1 && Math.abs(video.duration - 24.5) < 0.1;
    });
    assert.equal(await video.evaluate((element) => element.paused), true);
    await video.press("Space");
    await page.waitForFunction(() => {
      const video = document.querySelector(".loglift-preview video");
      return !video.paused && video.currentTime > 0.1;
    });
    await video.press("Space");
    assert.equal(await video.evaluate((element) => element.paused), true);
    const pausedAt = await video.evaluate((element) => element.currentTime);
    await video.press("ArrowRight");
    await page.waitForFunction(
      (position) => document.querySelector(".loglift-preview video").currentTime > position + 0.05,
      pausedAt,
    );
    assert.equal(await video.evaluate((element) => element.muted), true);
    assert.equal(await page.locator("[data-core-step]").count(), 3);
    await page.locator(".language-switcher").click();
    const next = logliftPages[(logliftPages.indexOf(detail) + 1) % logliftPages.length];
    await page.locator(`[data-language="${next.locale}"]`).click();
    const nextURL = new URL(next.route, preview.origins.ajigu);
    if (/^en(?:-|$)/.test(next.locale)) nextURL.searchParams.set("lang", next.locale);
    await page.waitForURL(nextURL.href);
    assert.equal(await page.locator("html").getAttribute("lang"), next.locale);
    matrix.push({ site: "ajigu", route: detail.route, logliftNavigation: "passed" });
  }
  for (const detail of walkboxPages) {
    const homeRoute = detail.route.slice("/walkbox".length);
    await page.goto(preview.origins.ajigu + homeRoute, { waitUntil: "networkidle" });
    const card = page.locator('[data-product-id="walkbox"]');
    await expect(card.locator(".gallery-release")).toHaveText(/\S/);
    await expect(card.locator("time,.gallery-pricing")).toHaveCount(0);
    await card.click();
    await page.waitForURL(preview.origins.ajigu + detail.route);
    await expect(page.locator("html")).toHaveAttribute("lang", detail.locale);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://ajigu.com" + detail.route,
    );
    const alternateURLs = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) => Object.fromEntries(links.map((link) => [link.hreflang, link.href])));
    assert.deepEqual(alternateURLs, {
      ...Object.fromEntries(
        walkboxPages.map(({ locale, route }) => [locale, "https://ajigu.com" + route]),
      ),
      "x-default": "https://ajigu.com/walkbox/",
    });
    const beta = page.locator(".product-actions a").first();
    await expect(beta).toHaveAttribute("href", "https://testflight.apple.com/join/9XMxmAP6");
    await expect(beta).toHaveAttribute("target", "_blank");
    await expect(beta).toHaveText(detail.actions[0].label);
    await page.locator('.product-actions a[href="#showcase"]').click();
    await page.waitForURL("**/#showcase");
    const shots = page.locator("#showcase img");
    assert.equal(await shots.count(), detail.steps.length);
    for (const [index, step] of detail.steps.entries()) {
      const shot = shots.nth(index);
      await shot.scrollIntoViewIfNeeded();
      await expect(shot).toHaveAttribute("src", step.image);
      await expect(shot).toHaveAttribute("alt", step.alt);
      await expect.poll(() => shot.evaluate((image) => image.naturalWidth)).toBe(1206);
    }
    const next = walkboxPages[(walkboxPages.indexOf(detail) + 1) % walkboxPages.length];
    await page.locator(".language-switcher").click();
    await page.locator(`[data-language="${next.locale}"]`).click();
    await page.waitForURL((url) => url.pathname === next.route);
    await page.locator(`.product-actions a[href="${next.footerLinks[0].href}"]`).click();
    await page.waitForURL((url) => url.pathname === next.footerLinks[0].href);
    matrix.push({ site: "ajigu", route: detail.route, walkboxNavigation: "passed" });
  }
  let homeAfterSelection = "/";
  for (const site of products) {
    const contract = JSON.parse(
      await readFile(
        new URL(`../apps/ajigu/src/products/${site}/compatibility.json`, import.meta.url),
        "utf8",
      ),
    );
    for (const file of Object.keys(contract.compatibility).filter((file) =>
      file.endsWith("/index.html"),
    )) {
      const route = "/" + file.slice(0, -10);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          (await page.goto(preview.origins[site] + route, { waitUntil: "networkidle" })).status(),
          200,
        );
        assert.equal(await page.locator("h1").count(), 1, `${site}${route}: H1`);
        assert.ok((await page.locator("body").innerText()).length > 100);
        matrix.push({ site, route, width, compatibility: "passed" });
      }
    }
    await page.goto(preview.origins.ajigu + "/zh-hans/", { waitUntil: "networkidle" });
    await page.locator(`[data-product-id="${site}"]`).click();
    await page.waitForURL(preview.origins[site] + "/zh-hans/");
    await page.locator('footer.site-footer a[href="https://ajigu.com/"]').first().click();
    await page.waitForURL(preview.origins.ajigu + homeAfterSelection);
    await page.goto(preview.origins[site] + "/", { waitUntil: "networkidle" });
    await page.locator(".language-switcher").click();
    await page.locator('[data-language="zh-Hans"]').click();
    await page.waitForURL(preview.origins[site] + "/zh-hans/");
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hans");
    homeAfterSelection = "/zh-hans/";
  }
  await page.goto(preview.origins.gosleep + "/?lang=en-US", { waitUntil: "networkidle" });
  await page.locator('[data-event="1"]').click();
  assert.equal(await page.locator('[data-event="1"]').getAttribute("aria-checked"), "true");
  assert.match(await page.locator("[data-event-title]").textContent(), /talk/i);
  assert.equal(await page.locator(".night-bars .is-selected").count(), 6);
  await page.locator('[data-event="2"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator('[data-event="2"]').getAttribute("aria-checked"), "true");
  await page.goto(preview.origins.dailyapod + "/?lang=en", { waitUntil: "networkidle" });
  assert.match(
    await page.locator(".gallery-preview img").getAttribute("src"),
    /dailyapod-home.webp$/,
  );
  assert.equal(await page.locator('[data-view="0"]').getAttribute("aria-checked"), "true");
  const galleryViews = ["home", "discover", "search", "favorites", "sky", "solar", "mockup"];
  assert.equal(await page.locator("[data-view]").count(), galleryViews.length);
  for (const [index, view] of galleryViews.entries()) {
    await page.locator(`[data-view="${index}"]`).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction((file) => {
      const image = document.querySelector(".gallery-preview img");
      return image.src.endsWith(file) && image.complete && image.naturalWidth > 0;
    }, `dailyapod-${view}.webp`);
    const dimensions = await page.locator(".gallery-preview img").evaluate((image) => ({
      declared: [Number(image.getAttribute("width")), Number(image.getAttribute("height"))],
      natural: [image.naturalWidth, image.naturalHeight],
    }));
    assert.deepEqual(dimensions.declared, dimensions.natural);
  }
  await page.goto(preview.origins.tutu + "/?lang=en", { waitUntil: "networkidle" });
  await page.locator("[data-compare] [role=slider]").focus();
  await page.keyboard.press("Home");
  assert.equal(
    await page.locator("[data-compare] [role=slider]").getAttribute("aria-valuenow"),
    "0",
  );
  await page.keyboard.press("End");
  for (let i = 0; i < 15; i++) await page.keyboard.press("ArrowLeft");
  assert.match(await page.locator("[data-compare-demo]").getAttribute("style"), /--compare: 85%/);
  await page.locator("[data-compare] [role=slider]").focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(
    await page.locator("[data-compare] [role=slider]").getAttribute("aria-valuenow"),
    "84",
  );
  await page.goto(preview.origins.moodsk + "/zh-hans/", { waitUntil: "networkidle" });
  await page.locator(".desktop-showcase").scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".desktop-showcase nav button").count(), 6);
  const chapters = page.locator(".desktop-showcase nav button");
  assert.equal(await chapters.nth(0).getAttribute("aria-current"), "step");
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".desktop-showcase nav button")[1].getAttribute("aria-current") ===
      "step",
    null,
    { timeout: 16000 },
  );
  assert.equal(await page.locator("#pause").getAttribute("aria-pressed"), "true");
  await page.locator("#pause").click();
  for (let index = 0; index < 6; index++) {
    await page.locator(".desktop-showcase nav button").nth(index).click();
    assert.equal(
      await page.locator(".desktop-showcase nav button").nth(index).getAttribute("aria-current"),
      "step",
    );
    assert.ok((await page.locator("#title").innerText()).length > 0);
  }
  await page.locator("#replay").click();
  await page.goto(preview.origins.ajigu + "/zh-hans/", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".work-tile").count(), 8);
  assert.equal(await page.locator(".studio-hero,.studio-beliefs").count(), 0);
  await page.locator('[data-product-id="typenote"]').click();
  await page.waitForURL(preview.origins.typenote + "/?lang=zh");
  await page.waitForFunction(() => document.documentElement.lang === "zh-Hans");
  await page.locator("[data-note-input]").fill("hello");
  assert.equal(await page.locator("[data-note-output]").textContent(), "音符 5");
  const sound = page.locator("[data-sound]");
  assert.equal(await sound.getAttribute("aria-pressed"), "false");
  await sound.click();
  await page.waitForFunction(
    () => document.querySelector("[data-sound]").getAttribute("aria-pressed") === "true",
  );
  await page.evaluate(() =>
    dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })),
  );
  assert.equal(await sound.getAttribute("aria-pressed"), "false");
  await sound.click();
  await page.waitForFunction(
    () => document.querySelector("[data-sound]").getAttribute("aria-pressed") === "true",
  );
  await page.locator(".language-switcher").click();
  await page.locator('[data-lang="ja"]').click();
  assert.equal(await page.locator("[data-note-output]").textContent(), "音符 5");
  assert.match(page.url(), /lang=ja/);
  assert.equal(await page.locator("[data-note-input]").inputValue(), "hello");
  assert.equal(await page.locator(".language-switcher").getAttribute("aria-expanded"), "false");
  await page.locator(".language-switcher").click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".language-switcher").getAttribute("aria-expanded"), "false");
  await expect(page.getByRole("menu", { includeHidden: true })).toHaveCount(0);
  await expect(page.locator(".language-switcher")).toBeFocused();
  await page.locator('[data-note="7"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-note-output]")).toHaveText(/7$/);
  assert.equal(
    await page.locator(`a[href="https://github.com/huihuisang/TypeNote/releases/latest"]`).count(),
    2,
  );
  await page.locator("footer").getByRole("link", { name: "ajigu", exact: true }).click();
  await page.waitForURL(preview.origins.ajigu + "/ja/");
  await page.goto(preview.origins.ajigu + "/nameplate/about/", { waitUntil: "networkidle" });
  await page.locator("[data-name-input]").fill("<script>A & B</script>");
  assert.equal(await page.locator("[data-name-output]").textContent(), "<script>A & B</script>");
  assert.equal(await page.locator("[data-name-output] script").count(), 0);
  await page.locator("[data-name-input]").fill("");
  assert.equal(await page.locator("[data-name-output]").textContent(), "Alex Chen");
  for (const route of ["/nameplate/", "/nameplate/zh-hans/"]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(preview.origins.ajigu + route, { waitUntil: "networkidle" });
      assert.equal(await page.locator("#cardCanvas").getAttribute("width"), "2362");
      assert.ok(await page.locator("#downloadButton").isVisible());
      matrix.push({ site: "ajigu", route, width, editor: "passed" });
    }
  }
  const downloaded = page.waitForEvent("download");
  await page.locator("#downloadButton").click();
  const download = await downloaded;
  const pngFile = path.join(evidence, "nameplate-export.png");
  await download.saveAs(pngFile);
  const png = await readFile(pngFile);
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 2362);
  assert.equal(png.readUInt32BE(20), 2362);
  for (const route of [
    "/guides/keyboard-sounds/",
    "/guides/keyboard-sounds/zh-hans/",
    "/guides/keyboard-sounds/ja/",
  ]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(preview.origins.typenote + route, { waitUntil: "networkidle" });
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://ajigu.com/typenote" + route,
      );
      assert.ok((await page.locator(".shell").innerText()).length > 500);
      assert.ok((await page.locator("h2").count()) >= 4);
      matrix.push({ site: "typenote", route, width, guide: "passed" });
    }
  }
  for (const [search, saved, expected] of [
    ["?lang=ko", "ja", "ko"],
    ["?lang=invalid", "ja", "ja"],
    ["?lang=__proto__", "constructor", "en"],
    ["", "zht", "zh-Hant"],
  ]) {
    await page.goto(preview.origins.typenote + "/?lang=en", { waitUntil: "networkidle" });
    await page.evaluate((saved) => {
      localStorage.removeItem("ajigu-language");
      localStorage.setItem("tn-lang", saved);
    }, saved);
    await page.goto(preview.origins.typenote + "/" + search, { waitUntil: "networkidle" });
    await page.waitForFunction((expected) => document.documentElement.lang === expected, expected);
  }
  await context.close();
  const blocked = await browser.newContext();
  const blockedPage = await blocked.newPage();
  blockedPage.on("pageerror", (error) => errors.push(error.message));
  await blockedPage.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    });
  });
  await blockedPage.goto(preview.origins.typenote + "/?lang=zh", { waitUntil: "networkidle" });
  await blockedPage.waitForFunction(() => document.documentElement.lang === "zh-Hans");
  await blockedPage.locator(".language-switcher").click();
  await blockedPage.locator('[data-lang="ko"]').click();
  assert.equal(await blockedPage.locator("html").getAttribute("lang"), "ko");
  await blocked.close();
  for (const site of ["ajigu", ...Object.keys(legacySites)]) {
    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const target = await reduced.newPage();
    await target.goto(preview.origins[site] + "/", { waitUntil: "networkidle" });
    assert.ok(await target.locator("h1").isVisible());
    assert.equal(
      await target.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation.playState === "running").length,
      ),
      0,
    );
    await reduced.close();
    const plain = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await plain.newPage();
    await fallback.goto(preview.origins[site] + "/");
    assert.ok(await fallback.locator("h1").isVisible());
    assert.ok((await fallback.locator("main").innerText()).length > (site === "ajigu" ? 50 : 250));
    if (site === "typenote") assert.equal(await fallback.locator("#faq article").count(), 4);
    await plain.close();
  }
  const touch = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touch.newPage();
  await touchPage.goto(preview.origins.typenote + "/?lang=en", { waitUntil: "networkidle" });
  await touchPage.locator('[data-note="3"]').tap();
  assert.equal(await touchPage.locator("[data-note-output]").textContent(), "Note 3");
  await touch.close();
  assert.deepEqual(externalFonts, []);
  assert.deepEqual(errors, []);
  const build = await checkBuild();
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify(
      {
        matrix,
        errors,
        externalFonts,
        interactions: "passed",
        queryAndStorage: "passed",
        deniedStorage: "passed",
        reducedMotion: "passed",
        noJavaScript: "passed",
        pngExport: "2362x2362",
        build,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${matrix.length} page/viewport checks, React interactions, language boundaries, editor export and static contracts passed.`,
  );
} finally {
  await browser.close();
  await preview.close();
}

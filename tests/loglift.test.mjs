import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createHash } from "node:crypto";
import { legacySites } from "../packages/site-kit/config/urls.mjs";

const root = new URL("../", import.meta.url);
const json = async (file) => JSON.parse(await readFile(new URL(file, root), "utf8"));
const release = "https://github.com/huihuisang/DJI-LogLift/releases/tag/v0.1.0";

test("LogLift cards lead to reciprocal localized details without a legacy host", async () => {
  const homes = await json("apps/ajigu/src/content/home.json");
  const pages = await json("apps/ajigu/src/products/loglift/content/pages.json");
  assert.equal(Object.hasOwn(legacySites, "loglift"), false);
  assert.deepEqual(
    pages.map((page) => page.route).sort(),
    homes.map((home) => `/loglift${home.route}`).sort(),
  );
  for (const home of homes) {
    const route = `/loglift${home.route}`;
    const page = pages.find((page) => page.route === route);
    assert.equal(page.locale, home.locale);
    assert.equal(home.products.find((product) => product.id === "loglift").url, route);
    assert.equal(
      page.metadata.links.find((link) => link.rel === "canonical").href,
      `https://ajigu.com${route}`,
    );
    assert.deepEqual(page.languages, pages[0].languages);
    assert.ok(page.languages.some((link) => link.code === page.locale && link.href === route));
    const alternates = page.metadata.links.filter((link) => link.hreflang);
    assert.deepEqual(
      alternates,
      pages[0].metadata.links.filter((link) => link.hreflang),
    );
    assert.equal(new Set(alternates.map((link) => link.hreflang)).size, pages.length + 1);
    assert.ok(
      alternates.some(
        (link) => link.hreflang === "x-default" && link.href === "https://ajigu.com/loglift/",
      ),
    );
  }
});

test("LogLift details retain the preview release and structured product content", async () => {
  const pages = await json("apps/ajigu/src/products/loglift/content/pages.json");
  for (const page of pages) {
    assert.equal(page.actions[0].href, release);
    assert.match(page.note, /0\.1\.0/);
    assert.match(page.note, /macOS 14/);
    const ids = page.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ["features", "workflow", "limits", "faq", "download"])
      assert.ok(ids.includes(id));
    assert.ok(page.sections.find((section) => section.id === "faq").questions.length >= 3);
    assert.ok(
      page.sections
        .find((section) => section.id === "download")
        .links.some((link) => link.href === release),
    );
    const application = page.metadata.structuredData.find(
      (entry) => entry["@type"] === "SoftwareApplication",
    );
    assert.equal(application.operatingSystem, "macOS 14 or later");
    assert.equal(application.softwareVersion, "0.1.0 Preview");
    assert.equal(application.downloadUrl, release);
    assert.equal(application.url, `https://ajigu.com${page.route}`);
    assert.equal(Object.hasOwn(application, "aggregateRating"), false);
  }
});

test("LogLift gallery composition uses the authentic app home", async () => {
  const products = await json("design/mockups/products.json");
  const outputs = await json("design/mockups/outputs.json");
  const screens = await json("design/mockups/screens.json");
  const source = "design/mockups/screens/loglift-home.webp";
  assert.equal(products.loglift.template, "apple-macbookpro14");
  assert.equal(products.loglift.artwork, undefined);
  assert.deepEqual(products.loglift.screens, [source]);
  assert.deepEqual(
    outputs.loglift.screens.map((screen) => screen.file),
    [source],
  );
  assert.equal(screens[source].product, "loglift");
  assert.deepEqual(screens[source].size, [2560, 1800]);
  assert.equal(screens[source].proof.app.version, "0.1.0");
});

test("LogLift details demonstrate the core workflow with real media and static steps", async () => {
  const pages = await json("apps/ajigu/src/products/loglift/content/pages.json");
  const media = await json("packages/site-kit/media.json");
  const provenance = await json("design/mockups/videos.json");
  for (const page of pages) {
    assert.equal(page.coreDemo.src, "/studio/media/loglift/core-workflow.mp4");
    assert.equal(page.coreDemo.poster, "/studio/media/loglift/core-workflow-poster.webp");
    assert.deepEqual(
      page.coreDemo.steps.map((step) => step.id),
      ["import", "compare", "export"],
    );
    assert.ok(page.coreDemo.steps.every((step) => step.title && step.body));
    assert.ok(page.previewCaption && page.previewAlt && page.videoLinkLabel);
  }
  assert.equal(media["loglift/core-workflow.mp4"].width, 1920);
  assert.equal(media["loglift/core-workflow.mp4"].height, 1080);
  assert.equal(media["loglift/core-workflow.mp4"].duration, 24.5);
  assert.equal(provenance.loglift.audioTracks, 0);
  assert.equal(provenance.loglift.publication, "authorized");
  assert.deepEqual(provenance.loglift.demonstrates, ["import", "compare", "playback", "export"]);
  const bytes = await readFile(new URL("packages/site-kit/media/loglift/core-workflow.mp4", root));
  assert.equal(bytes.subarray(4, 8).toString(), "ftyp");
  assert.equal(createHash("sha256").update(bytes).digest("hex"), provenance.loglift.sourceSHA256);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readJSON = async (file) => JSON.parse(await readFile(new URL(file, root), "utf8"));

test("gallery mockups retain a transparent canvas", async () => {
  const gallery = await readJSON("apps/ajigu/src/content/gallery.json");
  for (const [product, { file }] of Object.entries(gallery)) {
    const bytes = await readFile(new URL(`apps/ajigu/public/gallery/${file}`, root));
    assert.equal(bytes.subarray(12, 16).toString(), "VP8X", product);
    assert.ok(bytes[20] & 0x10, `${product}: missing WebP alpha channel`);
  }
});

test("gallery assets retain source provenance and verified output bytes", async () => {
  const sources = await readJSON("packages/site-kit/icons/sources.json");
  const gallery = await readJSON("apps/ajigu/src/content/gallery.json");
  const outputs = await readJSON("design/mockups/outputs.json");
  const screens = await readJSON("design/mockups/screens.json");
  const products = ["typenote", "moodsk", "gosleep", "dailyapod", "tutu", "nameplate", "loglift"];
  assert.deepEqual(Object.keys(gallery).sort(), products.sort());
  for (const product of products) {
    assert.equal(
      sources.filter((item) => item.product === product && item.role === "icon").length,
      1,
    );
    const mockup = gallery[product];
    assert.deepEqual([mockup.width, mockup.height], [1600, 1200]);
    assert.equal(outputs[product].file, `apps/ajigu/public/gallery/${mockup.file}`);
    const bytes = await readFile(new URL(outputs[product].file, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), outputs[product].sha256);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    for (const screen of outputs[product].screens) {
      const bytes = await readFile(new URL(screen.file, root));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), screen.sha256);
    }
  }
  for (const source of sources) {
    assert.ok(source.proof);
    assert.match(source.sourceSHA256, /^[a-f0-9]{64}$/);
    const bytes = await readFile(new URL(source.file, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.file);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  }
  for (const [file, screen] of Object.entries(screens)) {
    assert.ok(screen.proof, file);
    const bytes = await readFile(new URL(file, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), screen.sha256, file);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP", file);
  }
});

test("gallery facts cover each product and all localized pricing labels", async () => {
  const pages = await readJSON("apps/ajigu/src/content/home.json");
  const facts = await readJSON("apps/ajigu/src/content/product-facts.json");
  const copy = await readJSON("packages/site-kit/src/copy.json");
  assert.deepEqual(Object.keys(facts).sort(), pages[0].products.map(({ id }) => id).sort());
  for (const page of pages) {
    const labels = copy[page.locale].gallery;
    assert.ok(labels.firstRelease);
    assert.ok(labels.releaseUnknown);
    assert.ok(labels.releaseEstimate);
    for (const { id } of page.products) {
      const fact = facts[id];
      assert.ok(labels.pricing[fact.pricing], `${id}: ${page.locale}`);
      assert.ok(fact.sources.length > 0);
      for (const source of fact.sources) assert.equal(new URL(source).protocol, "https:");
      assert.match(fact.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      if (fact.releaseDate !== null) {
        assert.match(fact.releaseDate, /^\d{4}-\d{2}-\d{2}$/);
        assert.equal(new Date(fact.releaseDate).toISOString().slice(0, 10), fact.releaseDate);
        assert.ok(fact.releaseDate <= fact.checkedAt);
      }
    }
  }
  assert.equal(facts.nameplate.releaseDate, "2026-09-04");
  assert.equal(facts.nameplate.releaseDateEstimated, true);
  assert.equal(facts.loglift.pricing, "preview");
  assert.equal(facts.tutu.pricing, "paidExport");
  for (const id of ["moodsk", "gosleep", "dailyapod"]) {
    assert.equal(facts[id].pricing, "freemium");
  }
});

test("published release dates match the retained primary source responses", async () => {
  const facts = await readJSON("apps/ajigu/src/content/product-facts.json");
  const evidence = "docs-ai/003-gallery-home/evidence-card-metadata/";
  const apple = await readJSON(evidence + "apple-lookup.json");
  for (const [id, appId] of Object.entries({
    moodsk: 6752535811,
    gosleep: 6799618137,
    dailyapod: 1573247808,
    tutu: 6480340301,
  })) {
    const app = apple.results.find(({ trackId }) => trackId === appId);
    assert.equal(facts[id].releaseDate, app.releaseDate.slice(0, 10));
    assert.equal(app.price, 0);
    assert.ok(facts[id].sources.some((source) => source.includes(String(appId))));
  }
  for (const id of ["typenote", "loglift"]) {
    const releases = await readJSON(evidence + id + "-releases.json");
    const first = releases
      .filter(({ draft }) => !draft)
      .sort((a, b) => a.published_at.localeCompare(b.published_at))[0];
    assert.equal(facts[id].releaseDate, first.published_at.slice(0, 10));
    assert.ok(facts[id].sources.includes(first.html_url));
  }
});

test("Nameplate launch estimate follows its first retained deployment in Shanghai time", async () => {
  const facts = await readJSON("apps/ajigu/src/content/product-facts.json");
  const evidence = "docs-ai/003-gallery-home/evidence-card-metadata/";
  const initial = await readJSON(evidence + "nameplate-initial-commit.json");
  const deployment = await readJSON(evidence + "nameplate-first-deployment.json");
  assert.equal(initial.message, "Initial release of nameplate studio");
  assert.equal(deployment.conclusion, "success");
  assert.ok(initial.date < deployment.created_at);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(deployment.updated_at));
  assert.equal(facts.nameplate.releaseDate, date);
  assert.equal(facts.nameplate.releaseDateEstimated, true);
  assert.ok(facts.nameplate.sources.includes(deployment.html_url));
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createHash } from "node:crypto";
import { legacySites } from "../packages/site-kit/config/paths.mjs";

const root = new URL("../", import.meta.url);
const json = async (file) => JSON.parse(await readFile(new URL(file, root), "utf8"));
const expected = { moodsk: [4, 8771], tutu: [5, 8772], gosleep: [8, 8773], dailyapod: [5, 8774] };

for (const [name, [count, port]] of Object.entries(expected)) {
  test(`${name} retains its original domains, language routes, downloads and public files`, async () => {
    const contract = await json(`apps/ajigu/src/products/${name}/compatibility.json`);
    const pages = await json(`apps/ajigu/src/products/${name}/content/pages.json`);
    assert.equal(legacySites[name].domain, contract.domain);
    assert.equal(legacySites[name].port, port);
    assert.equal(pages.length, count);
    assert.deepEqual(
      pages.map(({ route, locale, actions }) => ({ route, locale, actions })),
      contract.routes,
    );
    const alternates = pages[0].metadata.links.filter((link) => link.hreflang);
    for (const page of pages) {
      assert.deepEqual(
        page.metadata.links.filter((link) => link.hreflang),
        alternates,
      );
      assert.deepEqual(
        page.metadata.links.filter((link) => link.rel === "canonical").map((link) => link.href),
        [`https://${contract.domain}${page.route}`],
      );
      assert.ok(
        page.languages.some((link) => link.code === page.locale && link.href === page.route),
      );
      for (const section of page.sections)
        assert.doesNotMatch(JSON.stringify(section), /<script\b|on(?:click|load|error)=/i);
    }
    for (const [file, digest] of Object.entries(contract.compatibility)) {
      const bytes = await readFile(new URL(`apps/ajigu/public/${name}/${file}`, root));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), digest, file);
    }
    for (const [file, digest] of Object.entries(contract.legacyStudio)) {
      assert.equal(
        createHash("sha256")
          .update(await readFile(new URL(file, root)))
          .digest("hex"),
        digest,
        file,
      );
    }
  });
}

test("the Go Sleep demo and footer retain their sample and wellness boundaries", async () => {
  for (const page of await json("apps/ajigu/src/products/gosleep/content/pages.json"))
    assert.ok(page.footerText);
  const messages = await json("packages/site-kit/src/copy.json");
  for (const copy of Object.values(messages)) {
    assert.ok(copy.sample);
    assert.equal(copy.events.length, 3);
    assert.equal(copy.eventDetails.length, 3);
  }
  const source = await readFile(
    new URL("apps/ajigu/src/products/gosleep/components/NightPreview.tsx", root),
    "utf8",
  );
  assert.doesNotMatch(source, /getUserMedia|AudioContext|fetch\(/);
});

test("TUTU keeps the verified comparison alignment and original local photos", async () => {
  const product = await json("apps/ajigu/src/products/tutu/content/product.json");
  assert.equal(product.comparison.aspect, "800 / 531");
  assert.equal(product.comparison.offset, -101.5960686211129);
  const contract = await json("apps/ajigu/src/products/tutu/compatibility.json");
  assert.ok(
    contract.media.includes("tutu-before.webp") && contract.media.includes("tutu-after.webp"),
  );
});

test("DailyApod retains the older second screenshot URL", async () => {
  const contract = await json("apps/ajigu/src/products/dailyapod/compatibility.json");
  assert.ok(contract.media.includes("dailyapod-2.webp"));
});

test("editorial migration retains localized privacy, compatibility and attribution statements", async () => {
  const contract = await json("tests/fixtures/editorial-content.json");
  const normalize = (value) =>
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, "")
      .toLowerCase();
  for (const entry of contract) {
    const pages = await json(`apps/ajigu/src/products/${entry.product}/content/pages.json`);
    const page = pages.find((page) => page.route === entry.route);
    const text = normalize(JSON.stringify(page.sections));
    for (const phrase of entry.phrases)
      assert.ok(text.includes(normalize(phrase)), `${entry.product}${entry.route}: ${phrase}`);
  }
});

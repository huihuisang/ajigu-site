import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readJSON = async (file) => JSON.parse(await readFile(new URL(file, root), "utf8"));

test("gallery assets retain source provenance and verified output bytes", async () => {
  const sources = await readJSON("packages/site-kit/icons/sources.json");
  const gallery = await readJSON("apps/ajigu/src/content/gallery.json");
  const outputs = await readJSON("design/mockups/outputs.json");
  const products = ["typenote", "moodsk", "gosleep", "dailyapod", "tutu", "nameplate"];
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
});

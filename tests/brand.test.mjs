import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root));

test("official mascot deliverables retain their recorded PNG dimensions and source hashes", async () => {
  const base = "design/brand/ajigu/";
  const manifest = JSON.parse(await read(base + "manifest.json"));
  assert.equal(manifest.reference, "reference.png");
  assert.deepEqual(manifest.files.map(({ file }) => file).sort(), [
    "mascot-promo-banner.png",
    "mascot-three-view.png",
    "reference.png",
  ]);
  for (const asset of manifest.files) {
    const bytes = await read(base + asset.file);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), asset.width);
    assert.equal(bytes.readUInt32BE(20), asset.height);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
  }
  const attribution = await read("nameplate/assets/ajigu-logo.png");
  for (const product of ["typenote", "moodsk", "gosleep", "dailyapod", "tutu"]) {
    assert.deepEqual(await read(`apps/ajigu/public/${product}/assets/ajigu-logo.png`), attribution);
  }
  const footer = await read("packages/site-kit/media/ajigu.webp");
  assert.deepEqual(footer, await read("nameplate/assets/ajigu-logo.webp"));
  assert.deepEqual(footer, await read("studio/media/ajigu.webp"));
});

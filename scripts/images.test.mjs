import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const routes = ["", "zh-hans/", "zh-hant/", "ja/", "ko/", "nameplate/", "nameplate/zh-hans/"];

test("static display images use WebP and reserve their layout space", async () => {
  for (const route of [...routes, "404.html"]) {
    const html = await readFile(new URL(route === "404.html" ? route : `${route}index.html`, root), "utf8");
    for (const [tag] of html.matchAll(/<img\b[^>]+\bsrc="[^"]+"[^>]*>/g)) {
      const src = tag.match(/\bsrc="([^"]+)"/)[1];
      assert.ok(src.endsWith(".webp"), `${route}: ${src}`);
      assert.match(tag, /\bwidth="\d+"/);
      assert.match(tag, /\bheight="\d+"/);
      await readFile(new URL(src.startsWith("/") ? src.slice(1) : `${route}${src}`, root));
    }
  }
});

test("first-row product icons load eagerly and later icons load lazily", async () => {
  for (const route of routes.slice(0, 5)) {
    const html = await readFile(new URL(`${route}index.html`, root), "utf8");
    const icons = [...html.matchAll(/<img\b[^>]+class="app-icon"[^>]*>/g)].map(([tag]) => tag);
    assert.equal(icons.length, 6);
    for (const [index, icon] of icons.entries()) {
      assert.match(icon, /\bdecoding="async"/);
      if (index < 3) assert.doesNotMatch(icon, /\bloading="lazy"/);
      else assert.match(icon, /\bloading="lazy"/);
    }
    assert.doesNotMatch(html.match(/<img\b[^>]+class="brand-logo"[^>]*>/)[0], /\bloading="lazy"/);
  }
});

// cwebp emits VP8 frames for lossy images and VP8L frames for lossless images.
function dimensions(image) {
  assert.equal(image.subarray(0, 4).toString(), "RIFF");
  assert.equal(image.subarray(8, 12).toString(), "WEBP");
  for (let offset = 12; offset + 8 <= image.length;) {
    const type = image.subarray(offset, offset + 4).toString();
    const length = image.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === "VP8 ") return [image.readUInt16LE(data + 6) & 0x3fff, image.readUInt16LE(data + 8) & 0x3fff];
    if (type === "VP8L") {
      const bits = image.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + length + (length % 2);
  }
  throw new Error("No WebP image frame found");
}

test("compressed assets keep original dimensions and reduce bytes", async () => {
  const report = JSON.parse(await readFile(new URL("assets/image-sizes.json", root), "utf8"));
  assert.equal(report.images.length, 15);
  for (const image of report.images) {
    const source = await readFile(new URL(image.source, root));
    const output = await readFile(new URL(image.output, root));
    assert.deepEqual(dimensions(output), [source.readUInt32BE(16), source.readUInt32BE(20)], image.output);
    assert.equal(source.length, image.sourceBytes);
    assert.equal(output.length, image.outputBytes);
    assert.ok(output.length < source.length, image.output);
    if (image.source.includes("/templates/")) assert.ok(output.length < source.length * 0.2, image.output);
  }
});

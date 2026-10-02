import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const app = await readFile(new URL("nameplate/app.js", root), "utf8");
const catalogSource = app.match(/const TEMPLATES = \[[\s\S]*?\n\];/)[0];
const classic = { naturalWidth: 2362, naturalHeight: 2362 };
const backgrounds = Object.fromEntries(["navy", "coral", "forest"].map((id) => [id, { naturalWidth: 2362, naturalHeight: 1181 }]));

test("thumbnail dimensions are reserved before images load", () => {
  const cards = [];
  const context = {
    TEMPLATES: [{ id: "classic", nameKey: "templateClassic" }],
    currentTemplateId: "classic",
    templateThumbnail: () => "data:image/png;base64,test",
    t: () => "Classic",
    applyTemplate() {},
    templateStrip: { replaceChildren() {}, append: (card) => cards.push(card) },
    document: { createElement: (tag) => ({ tag, children: [], width: 0, height: 0, setAttribute() {}, addEventListener() {}, append(...children) { this.children.push(...children); } }) },
  };
  const render = app.match(/function buildTemplateStrip\(\) \{[\s\S]*?\n\}/)[0];
  vm.runInNewContext(`${render}; buildTemplateStrip();`, context);
  const image = cards[0].children.find((child) => child.tag === "img");
  assert.equal(image.width, 240);
  assert.equal(image.height, 120);
});

function catalog(width = 2362, height = 2362) {
  const context = { template: classic, generatedTemplateBackgrounds: backgrounds, TEMPLATE_SIZE: 2362, nextLayerId: 1, card: { width, height }, panelHeight: () => height / 2, BUILTIN_FONTS: Array.from({ length: 6 }, (_, i) => ({ family: `Font ${i}` })), t: () => "Guest", createTextLayer: (options) => ({ type: "text", ...options }), defaultLayerOptions: () => ({ role: "name" }) };
  const backgroundFunction = app.match(/function createBackgroundLayer\([^)]*\) \{[\s\S]*?\n\}/)[0];
  const textOptions = app.match(/function nameplateTextOptions\([\s\S]*?\n\}(?=\n)/)?.[0] || "";
  vm.runInNewContext(`${backgroundFunction}\n${textOptions}\n${catalogSource}\nthis.catalog = TEMPLATES;`, context);
  return context.catalog;
}

test("published catalog contains all source-project templates", () => {
  assert.deepEqual(Array.from(catalog(), (item) => item.id), ["blank", "classic", "navy", "coral", "forest"]);
});

test("new backgrounds use the full panel instead of the legacy lower-half crop", () => {
  for (const item of catalog().filter((item) => item.id !== "blank" && item.id !== "classic")) {
    const layers = item.buildLayers();
    assert.equal(layers[0].image, backgrounds[item.id]);
    assert.equal(layers[0].srcRect, undefined);
    assert.equal(layers[0].aspectRatio, 2);
    assert.equal(layers[1].role, "name");
    assert.equal(layers[1].text, "Guest");
  }
  const background = catalog().find((item) => item.id === "classic").buildLayers()[0];
  assert.deepEqual(Array.from(background.srcRect), [0, 1181, 2362, 1181]);
});

test("new template text scales with card dimensions", () => {
  for (const item of catalog(1181, 1181).filter((item) => ["navy", "coral", "forest"].includes(item.id))) {
    const name = item.buildLayers()[1];
    assert.equal(name.x, 590.5);
    assert.equal(name.y, 295);
    assert.equal(name.size, item.id === "coral" ? 225 : 220);
  }
});

test("all template panel files are available and have the expected dimensions", async () => {
  for (const filename of ["navy-gold.png", "coral.png", "forest.png"]) {
    const image = await readFile(new URL(`nameplate/assets/templates/${filename}`, root));
    assert.equal(image.subarray(1, 4).toString(), "PNG");
    const width = image.readUInt32BE(16);
    const height = image.readUInt32BE(20);
    assert.ok(width >= 1600);
    assert.equal(width, height * 2);
  }
});

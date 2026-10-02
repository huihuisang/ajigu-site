import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const app = await readFile(new URL("../nameplate/app.js", import.meta.url), "utf8");
const sourceFunction = (name) => app.match(new RegExp(`function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";
const fonts = app.match(/const BUILTIN_FONTS = \[[\s\S]*?\n\];/)[0];

function editor(locale) {
  const context = {
    currentLocale: locale, nextLayerId: 1,
    card: { width: 2362, height: 2362 }, TEMPLATE_SIZE: 2362, panelHeight: () => 1181,
    getLocale: () => context.currentLocale,
    t: (key) => key,
  };
  vm.runInNewContext(`${fonts}\n${sourceFunction("getDefaultFont")}\n${sourceFunction("createTextLayer")}\nthis.createLayer = createTextLayer;`, context);
  return context;
}

test("new text uses a Latin default in English and Heiti in Chinese", () => {
  assert.equal(editor("en").createLayer().font, "system-ui, sans-serif");
  assert.equal(editor("zh-CN").createLayer().font, '"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif');
  assert.equal(editor("en").createLayer({ font: "Georgia" }).font, "Georgia");
});

test("the classic number layer uses the locale default font", () => {
  const context = editor("en");
  vm.runInNewContext(`${sourceFunction("defaultLayerOptions")}\nthis.number = createTextLayer(defaultLayerOptions("number"));`, context);
  assert.equal(context.number.font, "system-ui, sans-serif");
  assert.equal(context.number.usesDefaultFont, true);
});

test("built-in font labels follow the locale and custom names stay unchanged", () => {
  const context = editor("en");
  vm.runInNewContext(`const translations = ${app.match(/^const translations = (\{[\s\S]*?\n\});/m)[1]};\nthis.copy = translations;`, context);
  context.t = (key) => context.copy[context.currentLocale][key];
  context.customFonts = [{ family: "Uploaded Font", label: "My Font.ttf" }];
  vm.runInNewContext(`${sourceFunction("getFontLabel")}\nthis.label = getFontLabel;`, context);
  assert.equal(context.label("system-ui, sans-serif"), "System Sans (default)");
  assert.equal(context.label('"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif'), "Heiti");
  context.currentLocale = "zh-CN";
  assert.equal(context.label('"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif'), "黑体（默认）");
  assert.equal(context.label("Uploaded Font"), "My Font.ttf");
});

test("language changes update automatic fonts but keep manual choices", () => {
  const context = editor("en");
  const automatic = context.createLayer({ text: "Alex", role: "name" });
  const manual = context.createLayer({ text: "Sam" });
  Object.assign(context, {
    layers: [automatic, manual],
    translations: { en: {}, "zh-CN": {} },
    localeMetadata: { en: { path: "/nameplate/" }, "zh-CN": { path: "/nameplate/zh-hans/" } },
    location: { protocol: "file:" }, localStorage: { setItem() {} },
    languageDropdown: { setValue() {} },
    getRoleLayer: () => automatic, getSelectedLayer: () => manual,
    updateFontPickerLabel() {}, render() {}, closeFontModal() {},
    clearTemplateThumbnails() {}, applyTranslations() {}, updateBatchUi() {},
  });
  vm.runInNewContext(`${sourceFunction("applyFontSelection")}\n${sourceFunction("setLocale")}\napplyFontSelection("system-ui, sans-serif"); setLocale("zh-CN");`, context);
  assert.equal(automatic.font, '"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif');
  assert.equal(manual.font, "system-ui, sans-serif");
  assert.equal(automatic.text, "Alex");
  vm.runInNewContext('setLocale("en");', context);
  assert.equal(automatic.font, "system-ui, sans-serif");
});

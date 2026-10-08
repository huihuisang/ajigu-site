import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { getCopy } from "../studio/copy.mjs";

const root = new URL("../", import.meta.url);
const studio = JSON.parse(await readFile(new URL("studio/content.json", root), "utf8"));
const nameplate = JSON.parse(await readFile(new URL("studio/nameplate.json", root), "utf8"));

test("every studio locale exhibits the same six real products and keeps its language", async () => {
  for (const page of studio.pages) {
    const html = await readFile(new URL(page.file, root), "utf8");
    assert.equal([...html.matchAll(/class="exhibit exhibit-/g)].length,6);
    assert.deepEqual(page.products.map((product) => product.id),["typenote","moodsk","gosleep","dailyapod","tutu","nameplate"]);
    assert.ok(html.includes(`class="studio-brand brand" href="${page.route}"`));
    assert.ok(html.includes('id="studio"') && html.includes('id="apps"') && html.includes('id="contact"'));
    assert.doesNotMatch(html,/fonts\.(?:googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/);
  }
});

test("new Nameplate introductions point to the original localized editors", async () => {
  for (const page of nameplate.pages) {
    const html = await readFile(new URL(page.file, root), "utf8");
    assert.ok(html.includes(`href="${page.editor}"`));
    assert.ok(html.includes('data-name-input') && html.includes('data-name-output'));
    const editor = await readFile(new URL(`${page.editor.slice(1)}index.html`, root),"utf8");
    assert.ok(editor.includes('id="editorCanvas"') && editor.includes('id="downloadButton"'));
    assert.doesNotMatch(editor,/studio\/style\.css|studio\/runtime\.mjs/);
  }
});

test("generated marketing pages are current and a check does not rewrite them", async () => {
  const pages = [...studio.pages,...nameplate.pages];
  const before = await Promise.all(pages.map((page) => readFile(new URL(page.file,root),"utf8")));
  const result = spawnSync(process.execPath,[fileURLToPath(new URL("studio/build.mjs",root)),"--check"],{ encoding:"utf8" });
  assert.equal(result.status,0,result.stderr);
  const after = await Promise.all(pages.map((page) => readFile(new URL(page.file,root),"utf8")));
  assert.deepEqual(after,before);
});

test("shared controls have complete supported-language labels", () => {
  for (const locale of ["en","en-GB","zh-Hans","zh-Hant","ja","ko","de","fr"]) {
    const copy = getCopy(locale);
    for (const key of ["features","faq","tryTitle","preview","soundOn","soundOff","compare","name","openEditor"]) assert.ok(typeof copy[key] === "string" && copy[key].length,`${locale}: ${key}`);
    assert.equal(copy.events.length,3);
    assert.equal(copy.views.length,3);
    assert.equal(copy.taglines.length,6);
  }
});

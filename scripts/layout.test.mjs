import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";

const css = await readFile(new URL("../nameplate/styles.css", import.meta.url), "utf8");
const rule = (selector) => css.match(new RegExp(`(?:^|\\n\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]+)\\}`))[1];

test("desktop workspace height is bounded by the viewport and a fixed cap", () => {
  const shell = rule(".app-shell");
  assert.match(shell, /--workspace-height:\s*min\(100svh, 60rem\)/);
  assert.match(shell, /max-height:\s*var\(--workspace-height\)/);
  assert.match(shell, /grid-template-rows:\s*auto minmax\(0, 1fr\)/);
  assert.doesNotMatch(shell, /min-height:\s*100vh/);
  assert.match(rule(".control-panel"), /max-height:\s*100%/);
  assert.match(rule(".preview-panel"), /max-height:\s*100%/);
  assert.match(rule(".preview-panel"), /overflow-y:\s*auto/);
});

test("preview scaling does not change the exported canvas dimensions", () => {
  assert.match(rule(".canvas-frame canvas"), /max-height:\s*var\(--preview-height\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.app-shell\s*\{[^}]*max-height:\s*none/);
  const html = readFile(new URL("../nameplate/index.html", import.meta.url), "utf8");
  return html.then((source) => {
    assert.match(source, /<canvas id="editorCanvas" width="2362" height="1181"/);
    assert.match(source, /<canvas id="cardCanvas"[^>]*width="2362" height="2362"/);
  });
});

test("layout changes retain the complete SEO guides in both languages", async () => {
  const snapshots = {
    "nameplate/": "2410a9ef19c77355ba5a83c96544d8e5f191eb2a3142cd53f1e0fbae0f0eb127",
    "nameplate/zh-hans/": "ea1a5b42c6ce47b3d8f45b3b34c81b1de323c8a2601a5a3e99f8c10f7cf994d5",
  };
  for (const [route, expected] of Object.entries(snapshots)) {
    const html = await readFile(new URL(`../${route}index.html`, import.meta.url), "utf8");
    const guide = html.slice(html.indexOf('<section class="nameplate-guide"'), html.indexOf("</main>"));
    assert.equal(createHash("sha256").update(guide).digest("hex"), expected, route);
  }
});

test("the toolbar owns title, language, reset, and export controls", async () => {
  for (const path of ["nameplate/index.html", "nameplate/zh-hans/index.html"]) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    const toolbar = html.match(/<header class="app-toolbar">([\s\S]*?)<\/header>/)?.[1];
    assert.ok(toolbar, path);
    for (const id of ["page-title", "languageDropdownHost", "resetButton", "downloadButton"]) {
      assert.ok(toolbar.includes(`id="${id}"`), id);
      assert.equal([...html.matchAll(new RegExp(`id="${id}"`, "g"))].length, 1);
    }
    assert.doesNotMatch(html, /class="panel-actions"|class="eyebrow"/);
    const sidebar = html.slice(html.indexOf('<section class="control-panel"'), html.indexOf('<section class="preview-panel"'));
    assert.ok(sidebar.includes('id="layerList"'));
    assert.ok(sidebar.includes('id="layerInspector"'));
    assert.ok(sidebar.includes('id="batchFile"'));
    assert.doesNotMatch(sidebar, /<h1|id="downloadButton"/);
  }
});

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
    "nameplate/": "25182eea90001c94e23531d4be1fddf9acc63fc3efdc1e25284ab217eddfc943",
    "nameplate/zh-hans/": "a59be4d46b18263ec4f4b12fc9a4547bbbc6f4c301ce1a2033b09f2032c656a8",
  };
  for (const [route, expected] of Object.entries(snapshots)) {
    const html = await readFile(new URL(`../${route}index.html`, import.meta.url), "utf8");
    const guide = html.slice(html.indexOf('<section class="nameplate-guide"'), html.indexOf("</main>"));
    assert.doesNotMatch(guide, /locale-links|data-locale-link/);
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
    assert.doesNotMatch(html, /class="panel-actions"|class="preview-actions"|class="eyebrow"/);
    const sidebar = html.slice(html.indexOf('<section class="control-panel"'), html.indexOf('<section class="preview-panel"'));
    assert.ok(sidebar.includes('id="layerList"'));
    assert.ok(sidebar.includes('id="layerInspector"'));
    assert.ok(sidebar.includes('id="batchFile"'));
    assert.doesNotMatch(sidebar, /<h1|id="downloadButton"/);
  }
});

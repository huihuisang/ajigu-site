import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../nameplate/styles.css", import.meta.url), "utf8");
const rule = (selector) => css.match(new RegExp(`(?:^|\\n\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]+)\\}`))[1];

test("desktop workspace height is bounded by the viewport and a fixed cap", () => {
  const shell = rule(".app-shell");
  assert.match(shell, /--workspace-height:\s*min\(100svh, 60rem\)/);
  assert.match(shell, /height:\s*var\(--workspace-height\)/);
  assert.match(shell, /grid-template-rows:\s*minmax\(0, 1fr\)/);
  assert.doesNotMatch(shell, /min-height:\s*100vh/);
  assert.match(rule(".preview-panel"), /overflow-y:\s*auto/);
});

test("preview scaling does not change the exported canvas dimensions", () => {
  assert.match(rule(".canvas-frame canvas"), /max-height:\s*clamp\(6rem, calc\(var\(--workspace-height\) - 26rem\), 32rem\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.app-shell\s*\{[^}]*height:\s*auto/);
  const html = readFile(new URL("../nameplate/index.html", import.meta.url), "utf8");
  return html.then((source) => {
    assert.match(source, /<canvas id="editorCanvas" width="2362" height="1181"/);
    assert.match(source, /<canvas id="cardCanvas"[^>]*width="2362" height="2362"/);
  });
});

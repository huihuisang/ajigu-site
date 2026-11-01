import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import {
  namespaceNavigation,
  rewriteHTML,
  rewriteStatic,
  redirectHTML,
} from "../scripts/site-output.mjs";

test("static HTML keeps content and rewrites metadata and resource URLs", () => {
  const result = rewriteHTML(
    '<!doctype html><html><head><link rel="canonical" href="https://moodsk.ajigu.com/ja/"><meta property="og:image" content="/assets/icon.png"></head><body><p>Keep this text.</p><a href="#faq">FAQ</a><img src="../assets/photo.png"><script type="application/ld+json">{"url":"https://moodsk.ajigu.com/ja/"}</script></body></html>',
    "moodsk",
  );
  assert.match(result, /https:\/\/ajigu.com\/moodsk\/ja\//);
  assert.match(result, /content="\/moodsk\/assets\/icon.png"/);
  assert.match(result, /href="#faq"/);
  assert.match(result, /src="\.\.\/assets\/photo.png"/);
  assert.match(result, /Keep this text\./);
});
test("CSS URI transformation leaves data SVG and filter fragments intact", () => {
  const source =
    '.a{background:url("/assets/photo.png")}.b{filter:url(%23n)}.c{background:url(data:image/svg+xml;base64,eA==)}';
  const result = rewriteStatic(source, "moodsk", "style.css");
  assert.match(result, /\/moodsk\/assets\/photo.png/);
  assert.match(result, /url\(%23n\)/);
  assert.match(result, /data:image\/svg\+xml/);
});
test("Go Sleep legacy language navigation retains page, prefix, query and fragment", async () => {
  const source = await readFile(
    new URL("../apps/ajigu/public/gosleep/language.js", import.meta.url),
    "utf8",
  );
  let target;
  const location = {
    pathname: "/gosleep/support/",
    search: "?lang=ja&tag=a&tag=b&empty=&ref=a%2Fb",
    hash: "#contact",
    origin: "https://ajigu.com",
    href: "https://ajigu.com/gosleep/support/?lang=ja&tag=a&tag=b&empty=&ref=a%2Fb#contact",
    replace: (value) => (target = value),
  };
  vm.runInNewContext(namespaceNavigation(source, "gosleep"), {
    window: { location },
    document: { documentElement: { dataset: { locale: "en-US" } }, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { languages: ["en-US"] },
    URL,
    URLSearchParams,
  });
  assert.equal(
    target,
    "https://ajigu.com/gosleep/ja/support/?lang=ja&tag=a&tag=b&empty=&ref=a%2Fb#contact",
  );
});
test("redirect documents have static fallback and a fixed origin", () => {
  const result = redirectHTML("typenote", "/guides/keyboard-sounds/ja/");
  assert.match(result, /https:\/\/ajigu.com\/typenote\/guides\/keyboard-sounds\/ja\//);
  assert.match(result, /http-equiv="refresh"/);
  assert.match(result, /target.search=location.search/);
  assert.match(result, /target.hash=location.hash/);
  assert.doesNotMatch(result, /astro-island/);
});

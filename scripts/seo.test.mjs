import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const domain = "https://ajigu.com";
const routes = ["/", "/zh-hans/", "/zh-hant/", "/ja/", "/ko/", "/nameplate/", "/nameplate/zh-hans/"];
const pages = new Map(await Promise.all(routes.map(async (route) => [route, await readFile(new URL(`${route.slice(1)}index.html`, root), "utf8")])));

// Inspect the site's static tag attributes without running page scripts.
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
}

test("every sitemap URL has matching canonical and share metadata", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.deepEqual(urls.sort(), routes.map((route) => domain + route).sort());
  for (const [route, html] of pages) {
    const canonical = tags(html, "link").filter((tag) => tag.rel === "canonical");
    assert.deepEqual(canonical.map((tag) => tag.href), [domain + route]);
    const meta = tags(html, "meta");
    assert.equal(meta.find((tag) => tag.property === "og:url")?.content, domain + route);
    assert.ok(meta.find((tag) => tag.property === "og:image")?.content.startsWith(domain + "/"));
    assert.ok(meta.find((tag) => tag.name === "description")?.content);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.doesNotMatch(html, /<meta[^>]+(?:name="robots"|name="googlebot")[^>]+noindex/i);
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);
  }
});

test("hreflang clusters are reciprocal, self-referencing, and canonical", () => {
  for (const cluster of [routes.slice(0, 5), routes.slice(5)]) {
    const expected = tags(pages.get(cluster[0]), "link").filter((tag) => tag.hreflang);
    assert.ok(expected.some((tag) => tag.hreflang === "x-default"));
    assert.equal(new Set(expected.map((tag) => tag.hreflang)).size, expected.length);
    for (const route of cluster) {
      const alternates = tags(pages.get(route), "link").filter((tag) => tag.hreflang);
      assert.deepEqual(alternates, expected);
      assert.ok(alternates.some((tag) => tag.href === domain + route));
      for (const tag of alternates) assert.ok(cluster.includes(new URL(tag.href).pathname));
    }
  }
});

test("local assets, navigation, and sample downloads exist", async () => {
  for (const [route, html] of pages) {
    for (const tag of [...tags(html, "link"), ...tags(html, "script"), ...tags(html, "img"), ...tags(html, "a")]) {
      const href = tag.src || tag.href;
      if (!href || /^(?:https?:|data:|#)/.test(href)) continue;
      const path = new URL(href, domain + route).pathname;
      await access(new URL(path.slice(1) + (path.endsWith("/") ? "index.html" : ""), root));
    }
  }
});

test("Nameplate source language, metadata, schema, and sample agree", async () => {
  for (const [route, locale, sample] of [["/nameplate/", "en", "attendees.csv"], ["/nameplate/zh-hans/", "zh-CN", "attendees-zh.csv"]]) {
    const html = pages.get(route);
    assert.equal(tags(html, "html")[0].lang, locale);
    assert.equal(tags(html, "html")[0]["data-locale"], locale);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.inLanguage, locale);
    assert.equal(schema.url, domain + route);
    assert.ok(tags(html, "a").some((tag) => tag.id === "sampleCsvLink" && tag.href.endsWith(sample)));
    const csv = await readFile(new URL(`nameplate/examples/${sample}`, root), "utf8");
    assert.equal(csv.trim().split("\n").length, 4);
    assert.equal(csv.split("\n")[0], "name,number");
  }
  const ids = (html) => [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids(pages.get("/nameplate/")), ids(pages.get("/nameplate/zh-hans/")));
  const result = spawnSync(process.execPath, [new URL("scripts/build-nameplate.mjs", root).pathname, "--check"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

const app = await readFile(new URL("nameplate/app.js", root), "utf8");
const resolver = app.match(/function resolveInitialLocale\(\) \{[\s\S]*?\n\}/)[0];
const switcher = app.match(/function setLocale\(next, updateHistory = true\) \{[\s\S]*?\n\}/)[0];
const localeMetadata = { en: { path: "/nameplate/" }, "zh-CN": { path: "/nameplate/zh-hans/" } };

test("Nameplate initial locale is route-defined, not browser-defined", () => {
  for (const locale of ["en", "zh-CN"]) {
    const context = { URLSearchParams, localeMetadata, document: { documentElement: { dataset: { locale } } }, location: { protocol: "https:", search: "" }, navigator: { language: "ko" }, localStorage: { getItem: () => "zh-CN" } };
    assert.equal(vm.runInNewContext(`${resolver}; resolveInitialLocale()`, context), locale);
  }
});

test("legacy language URLs use the supported route and retain the hash", () => {
  for (const language of ["zh", "zh-CN", "zh-hant", "zht", "en", "ja", "ko"]) {
    const calls = [];
    const context = { URLSearchParams, localeMetadata, document: { documentElement: { dataset: { locale: "en" } } }, location: { protocol: "https:", pathname: "/nameplate/", search: `?lang=${language}`, hash: "#guide", replace: (url) => calls.push(["redirect", url]) }, history: { replaceState: (_, __, url) => calls.push(["replace", url]) } };
    vm.runInNewContext(`${resolver}; resolveInitialLocale()`, context);
    const chinese = /^(zh|zht)/.test(language);
    assert.deepEqual(calls, [[chinese ? "redirect" : "replace", `${localeMetadata[chinese ? "zh-CN" : "en"].path}#guide`]]);
  }
});

test("language switches preserve editor state and do not navigate on disk", () => {
  for (const protocol of ["https:", "file:"]) {
    const calls = [];
    const design = { text: "SEO QA" };
    const context = { translations: { en: {}, "zh-CN": {} }, localeMetadata, currentLocale: "en", layers: [], location: { protocol, hash: "" }, history: { pushState: (_, __, url) => calls.push(url) }, localStorage: { setItem() {} }, languageDropdown: { setValue() {} }, t: () => "Guest", getRoleLayer: () => design, clearTemplateThumbnails() {}, applyTranslations() {}, updateBatchUi() {}, render() {}, design };
    vm.runInNewContext(`${switcher}; setLocale('zh-CN'); setLocale('zh-CN'); setLocale('ko');`, context);
    assert.equal(context.currentLocale, "zh-CN");
    assert.equal(context.design.text, "SEO QA");
    assert.deepEqual(calls, protocol === "https:" ? ["/nameplate/zh-hans/"] : []);
  }
});

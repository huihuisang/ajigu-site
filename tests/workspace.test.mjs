import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";
import { sites, legacySites } from "../packages/site-kit/config/paths.mjs";

const root = new URL("../", import.meta.url);
const read = async (name) => JSON.parse(await readFile(new URL(name, root), "utf8"));

test("one application owns all five product modules and shared components", async () => {
  assert.deepEqual(Object.keys(sites), ["ajigu"]);
  for (const site of Object.keys(legacySites))
    assert.ok(
      await read(`apps/ajigu/src/products/${site}/content/metadata.json`).catch(() =>
        read(`apps/ajigu/src/products/${site}/content/pages.json`),
      ),
    );
  for (const name of Object.keys(sites)) {
    const app = await read(`apps/${name}/package.json`);
    assert.equal(app.dependencies["@ajigu/ui"], "workspace:*");
    assert.equal(app.dependencies["@ajigu/site-kit"], "workspace:*");
    assert.ok(app.dependencies.astro && app.dependencies.react);
  }
});
test("studio language clusters retain reciprocal metadata and product entries", async () => {
  const pages = await read("apps/ajigu/src/content/home.json");
  assert.equal(pages.length, 5);
  const alternates = (page) => page.metadata.links.filter((link) => link.hreflang);
  for (const page of pages) {
    assert.deepEqual(
      page.products.map((product) => product.id),
      ["typenote", "moodsk", "loglift", "gosleep", "dailyapod", "tutu", "nameplate", "walkbox"],
    );
    const loglift = page.products.find((product) => product.id === "loglift");
    assert.equal(loglift.url, `/loglift${page.route}`);
    assert.equal(loglift.platform, "macOS");
    assert.match(loglift.description, /Rec\.709/);
    const walkbox = page.products.find((product) => product.id === "walkbox");
    assert.equal(walkbox.url, `/walkbox${page.route}`);
    assert.equal(walkbox.platform, "iPhone");
    assert.deepEqual(alternates(page), alternates(pages[0]));
    assert.ok(alternates(page).some((link) => link.href === "https://ajigu.com" + page.route));
  }
  for (const page of await read("apps/ajigu/src/content/nameplate.json")) {
    assert.ok(["/nameplate/", "/nameplate/zh-hans/"].includes(page.editor));
    assert.ok(page.route.includes("/nameplate/about/"));
  }
});
test("every TypeNote language has all visible keys, including guide navigation", async () => {
  const messages = await read("apps/ajigu/src/products/typenote/content/translations.json");
  assert.deepEqual(Object.keys(messages).sort(), ["en", "ja", "ko", "zh", "zht"]);
  const keys = (value, prefix = "") =>
    Object.entries(value)
      .flatMap(([key, item]) =>
        typeof item === "object" ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`],
      )
      .sort();
  for (const value of Object.values(messages)) {
    assert.deepEqual(keys(value), keys(messages.en));
    assert.ok(value.nav.sound);
    for (const index of [1, 2, 3, 4]) assert.ok(value.faq[`q${index}`] && value.faq[`a${index}`]);
  }
});
test("copied guide metadata names its existing public URL rather than a malformed host", async () => {
  for (const suffix of ["", "zh-hans/", "ja/"]) {
    const route = `/guides/keyboard-sounds/${suffix}`;
    const html = await readFile(
      new URL(`apps/ajigu/public/typenote${route}index.html`, root),
      "utf8",
    );
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(canonical, "https://typenote.ajigu.com" + route);
    assert.doesNotMatch(html, /https:\/\/typenote\.ajigu\.com(?:index|zh-hans|ja)/);
  }
});
test("the reusable release-candidate workflow has no publication capability", async () => {
  const source = await readFile(new URL(".github/workflows/build-websites.yml", root), "utf8");
  const workflow = parse(source);
  assert.deepEqual(Object.keys(workflow.on).sort(), ["workflow_call", "workflow_dispatch"]);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  for (const value of Object.values(workflow.jobs.verify.env))
    assert.doesNotMatch(value, /runner\./);
  assert.ok(workflow.jobs.verify.steps.some((step) => step.run?.includes('"$GITHUB_ENV"')));
  assert.doesNotMatch(source, /secrets\.|configure-pages|deploy-pages|git push|pages:\s*write/);
  const uploads = workflow.jobs.verify.steps.filter((step) =>
    step.uses?.startsWith("actions/upload-artifact"),
  );
  assert.ok(uploads.some((step) => step.with.name === "ajigu-com"));
  assert.deepEqual(uploads.map((step) => step.with.name).sort(), ["ajigu-com", "browser-evidence"]);
});

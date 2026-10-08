import assert from "node:assert/strict";
import { readFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { sites, studioPaths } from "../packages/site-kit/config/paths.mjs";

const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
  );
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => attributes(tag));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function files(root, prefix = "") {
  const entries = await readdir(path.join(root, prefix), { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) =>
        entry.isDirectory()
          ? files(root, path.join(prefix, entry.name))
          : [path.join(prefix, entry.name)],
      ),
    )
  ).flat();
}
export async function checkBuild() {
  const summary = [];
  for (const name of Object.keys(sites)) {
    const locations = studioPaths(name),
      origin = `https://${sites[name].domain}`;
    const migrated = !["ajigu", "typenote"].includes(name);
    const contract = migrated
      ? JSON.parse(
          await readFile(path.join(locations.root, `apps/${name}/compatibility.json`), "utf8"),
        )
      : undefined;
    assert.equal(
      (await readFile(path.join(locations.site, "CNAME"), "utf8")).trim(),
      sites[name].domain,
    );
    const expectedRevision = process.env.STUDIO_REVISION || process.env.GITHUB_SHA;
    if (expectedRevision) {
      const release = JSON.parse(
        await readFile(path.join(locations.site, "site-release.json"), "utf8"),
      );
      assert.deepEqual(release, {
        sourceRepository: "huihuisang/ajigu-site",
        sourceRevision: expectedRevision,
        site: name,
        domain: sites[name].domain,
      });
    }
    const sitemap = await readFile(path.join(locations.site, "sitemap.xml"), "utf8");
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    for (const url of urls) {
      const pageURL = new URL(url);
      assert.equal(pageURL.origin, origin);
      const file = path.join(locations.site, pageURL.pathname, "index.html");
      const html = await readFile(file, "utf8");
      if (contract) {
        const source = contract.routes.find((entry) => entry.route === pageURL.pathname);
        if (source) {
          assert.match(html, new RegExp(`<html[^>]+lang="${source.locale}"`));
          const links = tags(html, "a").map((tag) => tag.href?.replaceAll("&amp;", "&"));
          for (const action of source.actions)
            assert.ok(
              links.includes(action.href),
              `${url}: missing original action ${action.href}`,
            );
          assert.doesNotMatch(
            html,
            /<script[^>]+src="[^\"]*(?:language\.js|lang-kit\.js|studio\/runtime\.mjs)/,
          );
          assert.equal(
            tags(html, "link").filter((link) => link.hreflang).length,
            contract.routes.length + 1,
          );
          assert.ok(
            tags(html, "a").filter((link) => link["data-slot"] === "button").length >=
              source.actions.length,
          );
        }
      }
      const canonical = tags(html, "link").filter((tag) => tag.rel === "canonical");
      assert.deepEqual(
        canonical.map((tag) => tag.href),
        [url],
        `${name}${pageURL.pathname}: canonical`,
      );
      assert.equal((html.match(/<h1\b/g) || []).length, 1, `${url}: H1`);
      if (name === "ajigu" && pageURL.pathname.includes("/nameplate/about/")) {
        const actions = html.match(/<div class="product-actions">([\s\S]*?)<\/div>/)?.[1] || "";
        assert.ok(
          tags(actions, "a").some((tag) => tag["data-slot"] === "button"),
          "Nameplate primary action must retain its button styles across Astro and React.",
        );
      }
      for (const tag of [
        ...tags(html, "link"),
        ...tags(html, "script"),
        ...tags(html, "img"),
        ...tags(html, "a"),
      ]) {
        const href = tag.src || tag.href;
        if (!href || /^(?:https?:|data:|#|mailto:|tel:)/.test(href)) continue;
        const target = new URL(href, url).pathname;
        await access(
          path.join(
            locations.site,
            decodeURIComponent(target),
            target.endsWith("/") ? "index.html" : "",
          ),
        );
      }
      for (const [, json] of html.matchAll(
        /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ))
        JSON.parse(json);
      if (name === "typenote" && pageURL.pathname === "/")
        assert.doesNotMatch(
          html,
          /<script[^>]+src="[^\"]*(?:i18n\.js|lang-kit\.js|studio\/runtime\.mjs)/,
        );
    }
    // Public compatibility resources must reach the output without build-time changes.
    const preserved = [];
    for (const file of await files(locations.public)) {
      const before = await readFile(path.join(locations.public, file)),
        after = await readFile(path.join(locations.site, file));
      assert.equal(digest(after), digest(before), `${name}: changed compatibility file ${file}`);
      preserved.push(file);
    }
    if (contract) {
      assert.equal(contract.domain, sites[name].domain);
      for (const [file, sha] of Object.entries({
        ...contract.compatibility,
        ...contract.legacyStudio,
      }))
        assert.equal(
          digest(await readFile(path.join(locations.site, file))),
          sha,
          `${name}: original public file changed ${file}`,
        );
      for (const source of contract.routes)
        assert.ok(urls.includes(origin + source.route), `${name}: missing route ${source.route}`);
    }
    if (name === "ajigu") {
      for (const file of [
        "nameplate/index.html",
        "nameplate/zh-hans/index.html",
        "nameplate/app.js",
      ]) {
        assert.equal(
          digest(await readFile(path.join(locations.root, file))),
          digest(await readFile(path.join(locations.site, file))),
          file,
        );
      }
      const body = await readFile(path.join(locations.site, "nameplate/index.html"), "utf8");
      assert.doesNotMatch(body, /_astro\/|astro-island|studio\/runtime/);
    }
    summary.push({
      site: name,
      pages: urls.length,
      canonical: "passed",
      compatibilityFiles: preserved.length,
    });
  }
  console.log(JSON.stringify({ buildChecks: summary }, null, 2));
  return summary;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await checkBuild();

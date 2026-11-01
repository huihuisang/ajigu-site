import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { studioPaths } from "../packages/site-kit/config/paths.mjs";
import {
  legacySites,
  origin,
  migrateURL,
  productPath,
  migrateContent,
} from "../packages/site-kit/config/urls.mjs";
import { files } from "./site-output.mjs";
import { migrateText } from "../packages/site-kit/config/urls.mjs";

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const urlFile = (directory, pathname) =>
  path.join(directory, decodeURIComponent(pathname), pathname.endsWith("/") ? "index.html" : "");
export async function checkBuild() {
  const locations = studioPaths("ajigu"),
    expected = process.env.STUDIO_REVISION || process.env.GITHUB_SHA;
  assert.equal((await readFile(path.join(locations.site, "CNAME"), "utf8")).trim(), "ajigu.com");
  await access(path.join(locations.site, ".nojekyll"));
  const favicon = await readFile(path.join(locations.site, "favicon.ico"));
  assert.equal(favicon.readUInt16LE(2), 1);
  assert.equal(
    digest(favicon.subarray(22)),
    digest(await readFile(path.join(locations.root, "assets/favicon.png"))),
  );
  if (expected)
    assert.deepEqual(await json(path.join(locations.site, "site-release.json")), {
      sourceRepository: "huihuisang/ajigu-site",
      sourceRevision: expected,
      site: "ajigu",
      domain: "ajigu.com",
      mode: "site",
    });
  for (const filename of ["BingSiteAuth.xml", "006457a8747962bd1d5a650d6b9a5365.txt"])
    assert.equal(
      digest(await readFile(path.join(locations.site, filename))),
      digest(await readFile(path.join(locations.root, filename))),
    );
  const sitemap = await readFile(path.join(locations.site, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  const rootSitemap = await readFile(path.join(locations.root, "sitemap.xml"), "utf8");
  const expectedURLs = [...rootSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  for (const [site] of Object.entries(legacySites)) {
    const source = await readFile(
      path.join(locations.root, "apps/ajigu/public", site, "sitemap.xml"),
      "utf8",
    );
    expectedURLs.push(
      ...[...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => migrateURL(url, site)),
    );
  }
  assert.deepEqual([...urls].sort(), [...new Set(expectedURLs)].sort());
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    assert.equal(new URL(url).origin, origin);
    const html = await readFile(urlFile(locations.site, new URL(url).pathname), "utf8"),
      $ = load(html);
    assert.deepEqual(
      $("link[rel=canonical]")
        .map((_, el) => $(el).attr("href"))
        .get(),
      [url],
    );
    assert.equal($("h1").length, 1, url);
    for (const text of $("script[type='application/ld+json']")
      .map((_, el) => $(el).html())
      .get())
      JSON.parse(text);
    for (const el of $("a[href],img[src],script[src],link[href],source[src]").toArray()) {
      const href = $(el).attr("src") || $(el).attr("href");
      if (!href || /^(?:data:|#|mailto:|tel:|javascript:)/.test(href)) continue;
      const target = new URL(href, url);
      assert.ok(
        !Object.values(legacySites).some((site) => site.domain === target.hostname),
        `${url}: old-host dependency ${href}`,
      );
      if (target.origin === origin) await access(urlFile(locations.site, target.pathname));
    }
  }
  const summaries = [];
  for (const [site, { domain, base }] of Object.entries(legacySites)) {
    const source = path.join(locations.root, "apps/ajigu/public", site);
    const contract = await json(
      path.join(locations.root, `apps/ajigu/src/products/${site}/compatibility.json`),
    );
    const marketing =
      site === "typenote"
        ? [{ route: "/", locale: "en" }]
        : await json(
            path.join(locations.root, `apps/ajigu/src/products/${site}/content/pages.json`),
          );
    for (const page of marketing) {
      const route = productPath(site, page.route),
        html = await readFile(urlFile(locations.site, route), "utf8"),
        $ = load(html);
      assert.equal($("html").attr("lang"), page.locale);
      assert.equal($("main.detail-flow").length, 1);
      assert.equal($(".product-art").length, 1);
      if (page.actions) {
        const links = $("a[href]")
          .map((_, el) => $(el).attr("href"))
          .get();
        for (const action of page.actions)
          assert.ok(links.includes(migrateURL(action.href, site)), `${route}: missing action`);
      }
      if (site !== "typenote") {
        const metadata = migrateContent(page.metadata, site);
        assert.deepEqual(
          $("link[hreflang]")
            .map((_, el) => $(el).attr("href"))
            .get(),
          metadata.links.filter((link) => link.hreflang).map((link) => link.href),
        );
      }
    }
    const legacyDirectory = path.join(locations.output, "redirects", site);
    assert.equal((await readFile(path.join(legacyDirectory, "CNAME"), "utf8")).trim(), domain);
    const marker = await json(path.join(legacyDirectory, "site-release.json"));
    assert.equal(marker.mode, "redirect");
    assert.equal(marker.domain, domain);
    assert.equal(marker.targetBase, origin + base + "/");
    if (expected) assert.equal(marker.sourceRevision, expected);
    const oldSitemap = await readFile(path.join(source, "sitemap.xml"), "utf8");
    const oldURLs = [...oldSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
    for (const url of oldURLs) {
      const route = new URL(url).pathname,
        $ = load(await readFile(urlFile(legacyDirectory, route), "utf8"));
      assert.equal($("link[rel=canonical]").attr("href"), migrateURL(url, site));
      assert.match($("meta[http-equiv=refresh]").attr("content"), /^0;url=https:\/\/ajigu.com\//);
      assert.equal($("astro-island").length, 0);
    }
    for (const file of await files(source)) {
      await access(path.join(locations.site, site, file));
      if (file.endsWith(".html")) {
        const original = load(await readFile(path.join(source, file), "utf8"));
        const transformed = load(await readFile(path.join(locations.site, site, file), "utf8"));
        original("script,style").remove();
        transformed("script,style").remove();
        const normalize = (text) => text.replace(/\s+/g, "");
        assert.equal(
          normalize(transformed("body").text()),
          normalize(migrateText(original("body").text(), site)),
          `${site}: changed document content ${file}`,
        );
      }
      if (file !== "CNAME" && !file.endsWith(".html"))
        assert.equal(
          digest(await readFile(path.join(source, file))),
          digest(await readFile(path.join(legacyDirectory, file))),
          `${site}: legacy resource ${file}`,
        );
      if (!/\.(?:html|css|js|mjs|json|xml|txt)$/.test(file))
        assert.equal(
          digest(await readFile(path.join(source, file))),
          digest(await readFile(path.join(locations.site, site, file))),
          `${site}: binary resource ${file}`,
        );
    }
    for (const [file, sha] of Object.entries(contract.legacyStudio || {}))
      assert.equal(
        digest(await readFile(path.join(legacyDirectory, file))),
        sha,
        `${site}: shared legacy resource ${file}`,
      );
    summaries.push({
      site,
      canonicalBase: origin + base + "/",
      pages: oldURLs.length,
      redirectDomain: domain,
      resources: "passed",
    });
  }
  return [
    {
      site: "ajigu",
      domain: "ajigu.com",
      pages: urls.length,
      products: summaries,
      canonical: "passed",
    },
  ];
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify({ buildChecks: await checkBuild() }, null, 2));

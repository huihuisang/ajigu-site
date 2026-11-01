import { load } from "cheerio";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  legacySites,
  origin,
  migrateURL,
  migrateText,
  migrateContent,
  productPath,
} from "../packages/site-kit/config/urls.mjs";

export async function files(directory, prefix = "") {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(directory, path.join(prefix, entry.name))
          : [path.join(prefix, entry.name)],
      ),
    )
  ).flat();
}
/** Keep legacy navigation code in its original path space without changing global Location. */
export function namespaceNavigation(source, site) {
  const { base, domain } = legacySites[site];
  return `(function(location){\n${source}\n})({
    get pathname(){const p=window.location.pathname;return p===${JSON.stringify(base)}?'/':p.startsWith(${JSON.stringify(base + "/")})?p.slice(${base.length}):p;},
    get search(){return window.location.search;},
    get hash(){return window.location.hash;},
    get href(){return window.location.href;},
    replace(value){
      const p=this.pathname;
      const old=new URL(String(value),'https://${domain}'+p+this.search+this.hash);
      let target=old;
      if(old.hostname===${JSON.stringify(domain)}||old.hostname==='ajigu.com'){
        const pathname=old.hostname==='ajigu.com'?old.pathname:(old.pathname===${JSON.stringify(base)}||old.pathname.startsWith(${JSON.stringify(base + "/")})?old.pathname:${JSON.stringify(base)}+old.pathname);
        target=new URL(pathname+old.search+old.hash,window.location.origin);
      }
      const explicitKeys=new Set(target.searchParams.keys());
      for(const [key,value] of new URLSearchParams(window.location.search)){if(!explicitKeys.has(key))target.searchParams.append(key,value);}
      if(!target.hash)target.hash=window.location.hash;
      window.location.replace(target.href);
    }
  });\n`;
}
export function rewriteHTML(source, site) {
  const $ = load(source);
  $("[href],[src],[poster],[action]").each((_, element) => {
    for (const attribute of ["href", "src", "poster", "action"]) {
      const value = $(element).attr(attribute);
      if (value) $(element).attr(attribute, migrateURL(value, site));
    }
  });
  $("meta[content]").each((_, element) => {
    const value = $(element).attr("content");
    if (/^(?:https?:\/\/|\/)[^\s]*$/.test(value))
      $(element).attr("content", migrateURL(value, site));
  });
  $("style").each((_, element) =>
    $(element).html(rewriteStatic($(element).html() || "", site, "inline.css")),
  );
  $("script").each((_, element) => {
    if ($(element).attr("src")) return;
    const text = $(element).html() || "";
    if ($(element).attr("type") === "application/ld+json") {
      $(element).html(
        JSON.stringify(migrateContent(JSON.parse(text), site)).replaceAll("<", "\\u003c"),
      );
    } else $(element).html(migrateText(text, site));
  });
  return $.html();
}
export function rewriteStatic(source, site, filename) {
  if (filename.endsWith(".html")) return rewriteHTML(source, site);
  if (filename.endsWith(".json"))
    return JSON.stringify(migrateContent(JSON.parse(source), site), null, 2) + "\n";
  if (filename.endsWith(".css"))
    return migrateText(source, site).replace(
      /url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g,
      (_, quote, value) => `url(${quote}${migrateURL(value, site)}${quote})`,
    );
  if (filename.endsWith(".js") && /(?:^|\/)lang(?:uage|-kit)\.js$/.test(filename))
    return namespaceNavigation(migrateText(source, site), site);
  return migrateText(source, site);
}
function escapeHTML(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
export function redirectHTML(site, legacyPath, fallback = false) {
  const { base } = legacySites[site];
  const target = origin + productPath(site, legacyPath);
  const encoded = JSON.stringify(target).replaceAll("<", "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Moved to ajigu</title><link rel="canonical" href="${escapeHTML(target)}"><script>let target=new URL(${encoded});${fallback ? `target.pathname=${JSON.stringify(base)}+(location.pathname.startsWith('/')?location.pathname:'/'+location.pathname);` : ""}target.search=location.search;target.hash=location.hash;location.replace(target.href);</script><meta http-equiv="refresh" content="0;url=${escapeHTML(target)}"></head><body><p>This page has moved to <a href="${escapeHTML(target)}">${escapeHTML(target)}</a>.</p></body></html>\n`;
}
export async function writeRedirects(root, output, revision) {
  for (const [site, { domain }] of Object.entries(legacySites)) {
    const source = path.join(root, "apps/ajigu/public", site);
    const destination = path.join(output, "redirects", site);
    await mkdir(destination, { recursive: true });
    await cp(source, destination, { recursive: true });
    for (const folder of ["studio", "licenses", "gallery"]) {
      await cp(path.join(output, "ajigu", folder), path.join(destination, folder), {
        recursive: true,
      });
    }
    const sitemap = await readFile(path.join(source, "sitemap.xml"), "utf8");
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, value]) => new URL(value).pathname,
    );
    for (const file of await files(source)) {
      if (file.endsWith(".html"))
        paths.push(file.endsWith("index.html") ? "/" + file.slice(0, -10) : "/" + file);
    }
    for (const route of new Set(paths)) {
      const file = path.join(destination, route, route.endsWith("/") ? "index.html" : "");
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, redirectHTML(site, route));
    }
    await writeFile(path.join(destination, "404.html"), redirectHTML(site, "/", true));
    await writeFile(path.join(destination, "CNAME"), domain + "\n");
    await writeFile(path.join(destination, ".nojekyll"), "");
    await writeFile(
      path.join(destination, "site-release.json"),
      JSON.stringify({
        sourceRepository: "huihuisang/ajigu-site",
        sourceRevision: revision,
        site,
        domain,
        mode: "redirect",
        targetBase: origin + legacySites[site].base + "/",
      }) + "\n",
    );
  }
}
export async function transformPublic(root, directory) {
  const allURLs = [];
  const robotRules = [];
  const rootSitemap = await readFile(path.join(directory, "sitemap.xml"), "utf8");
  allURLs.push(...[...rootSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => value));
  for (const site of Object.keys(legacySites)) {
    const product = path.join(directory, site);
    const sitemap = await readFile(path.join(product, "sitemap.xml"), "utf8");
    allURLs.push(
      ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => migrateURL(value, site)),
    );
    for (const file of await files(product)) {
      if (/\.(?:html|css|js|mjs|json|xml|txt)$/.test(file) && !/006457.*\.txt$/.test(file)) {
        const target = path.join(product, file);
        let text = await readFile(target, "utf8");
        text = rewriteStatic(text, site, file);
        if (file === "robots.txt") {
          text = text.replace(
            /^(Allow|Disallow):\s*(\/.*)$/gm,
            (_, rule, value) => `${rule}: ${productPath(site, value)}`,
          );
          robotRules.push(text.replace(/^Sitemap:.*$/gm, "").trim());
        }
        await writeFile(target, text);
      }
    }
  }
  const canonical = [...new Set(allURLs)];
  await writeFile(
    path.join(directory, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${canonical.map((url) => `<url><loc>${escapeHTML(url)}</loc></url>`).join("")}</urlset>\n`,
  );
  const robots = path.join(directory, "robots.txt");
  await writeFile(robots, (await readFile(robots, "utf8")) + "\n" + robotRules.join("\n\n") + "\n");
  const llms = path.join(directory, "llms.txt");
  await writeFile(llms, migrateText(await readFile(llms, "utf8"), "ajigu"));
}

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const sourceUrl = new URL("nameplate/index.html", root);
const source = await readFile(sourceUrl, "utf8");
const appSource = await readFile(new URL("nameplate/app.js", root), "utf8");

// Use the editor's own copy so static pages and language switches stay aligned.
function readObject(name) {
  const match = appSource.match(new RegExp(`^const ${name} = (\\{[\\s\\S]*?\\n\\});`, "m"));
  if (!match) throw new Error(`Missing constant: ${name}`);
  return vm.runInNewContext(`(${match[1]})`, {}, { timeout: 1000 });
}

const translations = readObject("translations");
const metadata = readObject("localeMetadata");
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function setAttribute(tag, name, value) {
  const attribute = `${name}="${escapeHtml(value)}"`;
  const pattern = new RegExp(`\\s${name}="[^"]*"`);
  return pattern.test(tag) ? tag.replace(pattern, () => ` ${attribute}`) : tag.replace(/\s*\/?>(?=$)/, (end) => ` ${attribute}${end}`);
}

function render(locale) {
  const copy = translations[locale];
  const page = metadata[locale];
  const url = `https://ajigu.com${page.path}`;
  let html = source.replace(/<html[^>]+>/, `<html lang="${locale}" data-locale="${locale}">`);
  html = html.replace(/(<([a-z][\w-]*)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/gi, (_, open, tag, key, close) => {
    if (!(key in copy)) throw new Error(`Missing ${locale} translation: ${key}`);
    return open + escapeHtml(copy[key]) + close;
  });
  html = html.replace(/<[a-z][^>]*\bdata-i18n-(placeholder|aria-label)="([^"]+)"[^>]*>/gi, (tag, attribute, key) => {
    if (!(key in copy)) throw new Error(`Missing ${locale} attribute: ${key}`);
    return setAttribute(tag, attribute, copy[key]);
  });
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/<meta\b[^>]*>/g, (tag) => {
    const key = tag.match(/(?:name|property)="([^"]+)"/)?.[1];
    const values = { description: page.description, "og:title": page.title, "og:description": page.description, "twitter:title": page.title, "twitter:description": page.description, "og:url": url, "og:locale": page.ogLocale };
    return key in values ? setAttribute(tag, "content", values[key]) : tag;
  });
  html = html.replace(/<link rel="canonical"[^>]*>/, (tag) => setAttribute(tag, "href", url));
  html = html.replace(/<a\b[^>]*\bdata-locale-link="([^"]+)"[^>]*>/g, (tag, language) => {
    tag = tag.replace(/\saria-current="[^"]*"/, "");
    return language === locale ? setAttribute(tag, "aria-current", "page") : tag;
  });
  html = html.replace(/<a id="sampleCsvLink"[^>]*>/, (tag) => setAttribute(tag, "href", page.sample));
  // Relative assets preserve the editor's direct-from-disk workflow.
  const assetPrefix = locale === "en" ? "" : "../";
  html = html.replace(/<(?:script|img|link)\b[^>]*>/g, (tag) => {
    if (tag.startsWith("<link") && !/rel="(?:stylesheet|icon|apple-touch-icon)"/.test(tag)) return tag;
    const attribute = tag.startsWith("<link") ? "href" : "src";
    const value = tag.match(new RegExp(`\\s${attribute}="([^"]+)"`))?.[1];
    if (!value || /^(?:https?:|data:)/.test(value)) return tag;
    return setAttribute(tag, attribute, assetPrefix + value.replace(/^\/nameplate\//, "").replace(/^\.\.\//, ""));
  });
  html = html.replace(/<a id="sampleCsvLink"[^>]*>/, (tag) => setAttribute(tag, "href", assetPrefix + page.sample.slice("/nameplate/".length)));
  html = html.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, open, close) => {
    const schema = JSON.parse(source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    Object.assign(schema, { url, inLanguage: locale, description: page.description });
    schema.offers.priceCurrency = page.currency;
    return `${open}\n${JSON.stringify(schema, null, 2).split("\n").map((line) => `    ${line}`).join("\n")}\n    ${close}`;
  });
  return html;
}

for (const locale of Object.keys(metadata)) {
  const destination = new URL(`${metadata[locale].path.slice(1)}index.html`, root);
  const html = render(locale);
  if (process.argv.includes("--check")) {
    const existing = await readFile(destination, "utf8");
    if (existing !== html) throw new Error(`Regenerate ${fileURLToPath(destination)}`);
  } else {
    await mkdir(new URL(".", destination), { recursive: true });
    await writeFile(destination, html);
  }
  console.log(`${locale}: ${metadata[locale].path}`);
}

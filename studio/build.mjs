import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getCopy } from "./copy.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(directory);
const check = process.argv.includes("--check");
let site = JSON.parse(await readFile(path.join(directory, "content.json"), "utf8"));
const failures = [];
const media = JSON.parse(await readFile(path.join(directory, "media.json"), "utf8"));
const escape = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const image = (file, alt, className = "", eager = false) => {
  const name = file.replace(/\.(?:png|jpg)$/, ".webp");
  const dimensions = media[name];
  if (!dimensions) throw new Error(`Missing media metadata: ${name}`);
  return `<img src="/studio/media/${name}" alt="${escape(alt)}" class="${className}" width="${dimensions.width}" height="${dimensions.height}" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
};
const dots = '<span class="studio-dots" aria-hidden="true"></span>';
const typeArt = (page) => page.locale.startsWith("zh") ? "typenote.png" : page.locale.startsWith("ja") ? "typenote-ja.webp" : "typenote-en.webp";

function header(page, copy, home = false) {
  const brand = home ? "ajigu" : site.name;
  const icon = home ? "/assets/logo.webp" : site.icon;
  const links = home
    ? `<a href="#studio">${copy.studio}</a><a href="#apps">${copy.work}</a><a href="#contact">${copy.contact}</a>`
    : `<a href="#features" data-copy="features">${copy.features}</a><a href="#faq" data-copy="faq">${copy.faq}</a>`;
  return `<header class="studio-header"><nav class="studio-nav studio-shell" aria-label="${escape(page.navLabel || copy.work)}">
    <a class="studio-brand brand" href="${page.route}"><img class="brand-logo" src="${icon}" alt="" width="48" height="48"><span>${brand}</span></a>
    ${home ? "" : `<a class="studio-by" href="https://ajigu.com/"><img src="/studio/media/ajigu.webp" alt="" width="27" height="27">by ajigu</a>`}
    <div class="studio-nav-links">${links}</div>${page.languages}${page.navAction ? `<div class="studio-nav-action">${page.navAction}</div>` : ""}
  </nav></header>`;
}

function shell(page, body, home = false) {
  const copy = getCopy(page.locale);
  const head = page.head.replace("</head>", '  <link rel="stylesheet" href="/studio/style.css?v=1">\n</head>');
  return `<!doctype html>\n<html lang="${page.locale}" data-locale="${page.locale}">\n${head}\n<body>\n${page.icons || ""}\n<a class="studio-skip" data-copy="skip" href="#${page.mainId || "main"}">${copy.skip}</a>\n<div class="studio-design ${home ? "studio-home" : `product-page product-${site.id}`}" data-product="${site.id}" data-studio-version="1">\n${header(page, copy, home)}\n${body}\n</div>\n${page.scripts || ""}\n<script type="module" src="/studio/runtime.mjs"></script>\n</body>\n</html>\n`;
}

function nameCard(copy, live = false) {
  return `<div class="desk-card"><strong ${live ? "data-name-output" : ""}>${escape(copy.sampleName)}</strong><small>ajigu</small></div>`;
}

function demo(page) {
  const copy = getCopy(page.locale);
  const label = (key) => `<span data-copy="${key}">${copy[key]}</span>`;
  if (site.id === "typenote") {
    return `<div class="demo-surface" data-note-demo><div class="demo-heading"><p>${label("preview")}</p><button type="button" data-sound aria-pressed="false">${label("soundOn")}</button></div>
      <div class="demo-keys">${[1,2,3,4,5,6,7].map((note) => `<button type="button" data-note="${note}" aria-label="${copy.note} ${note}">${note}</button>`).join("")}</div>
      <div class="demo-type"><input type="text" data-note-input aria-label="${copy.typeHint}" placeholder="${copy.typeHint}" autocomplete="off" maxlength="240"><output data-note-output aria-live="polite">${copy.note} —</output></div></div>`;
  }
  if (site.id === "gosleep") {
    return `<div class="demo-surface night-preview" data-night-demo><div><div class="demo-heading"><p>${copy.night}</p></div><div class="night-bars" aria-hidden="true">${[32,55,40,82,62,38,75,45,95,52,35,72,47,88,54,33,64,41].map((height, index) => `<i style="--bar:${height}%" data-event-group="${index % 3}"></i>`).join("")}</div><div class="demo-tabs">${copy.events.map((event, index) => `<button type="button" data-event="${index}" aria-pressed="${index === 0}">${event}</button>`).join("")}</div></div><div class="night-detail" aria-live="polite"><small>${copy.sample}</small><h3 data-event-title>${copy.events[0]}</h3><p data-event-detail>${copy.eventDetails[0]}</p></div></div>`;
  }
  if (site.id === "dailyapod") {
    return `<div class="demo-surface gallery-demo" data-gallery-demo><div class="demo-tabs">${copy.views.map((view,index) => `<button type="button" data-view="${index}" aria-pressed="${index === 0}">${view}</button>`).join("")}</div><div class="gallery-preview">${image("dailyapod.jpg", copy.views[0], "", true).replace("<img ", '<img data-gallery-image ')}</div></div>`;
  }
  if (site.id === "moodsk") return page.showcase;
  if (site.id === "tutu") {
    if (!site.comparison) throw new Error("TUTU requires a verified, aligned capture pair.");
    return `<div class="demo-surface"><div class="demo-heading"><p>${copy.compare}</p></div><div class="comparison-demo" data-compare-demo style="--photo-aspect:${site.comparison.aspect};--photo-offset:${site.comparison.offset}%"><div class="compare-viewport">${image("tutu-before.png", copy.original)}<div class="compare-result">${image("tutu-after.png", copy.result)}</div><span class="compare-line" aria-hidden="true"></span></div><label><span class="studio-visually-hidden">${copy.compare}</span><input type="range" min="0" max="100" value="50" aria-label="${copy.compare}" data-compare></label><div class="compare-labels"><span>${copy.result}</span><span>${copy.original}</span></div></div></div>`;
  }
  if (site.id === "nameplate") {
    return `<div class="demo-surface nameplate-demo" data-nameplate-demo><div class="nameplate-controls"><label for="preview-name">${copy.name}</label><p>${copy.nameHint}</p><input id="preview-name" data-name-input maxlength="48" value="${copy.sampleName}" autocomplete="off"><a class="studio-button" href="${page.editor}">${copy.openEditor} <span aria-hidden="true">↗</span></a></div><div class="nameplate-preview">${nameCard(copy, true)}</div></div>`;
  }
  return "";
}

function product(page) {
  const copy = getCopy(page.locale);
  const art = site.id === "nameplate" ? nameCard(copy) : image(site.id === "typenote" ? typeArt(page) : site.art, page.artAlt || site.name, "", true);
  const body = `<main id="${page.mainId || "main"}">
    <section class="product-hero studio-shell" id="hero"><div data-enter>
      <h1>${page.heading || site.name}</h1>${page.claim ? `<div class="product-claim">${page.claim}</div>` : ""}<div class="product-intro">${page.intro}</div>
      <div class="product-actions">${page.actions}</div>${page.note ? `<p class="product-note">${page.note}</p>` : ""}
    </div><div class="product-art product-art-${site.id}" data-enter style="--enter-delay:90ms">${art}${dots}</div></section>
    <section class="studio-demo studio-shell" id="showcase"><h2 data-copy="tryTitle">${copy.tryTitle}</h2>${demo(page)}</section>
    ${page.sections.join("\n")}
  </main>\n${page.footer}`;
  return shell(page, body);
}

function home(page) {
  const copy = getCopy(page.locale);
  const exhibit = (product, index) => {
    const art = product.id === "nameplate" ? nameCard(copy) : image(product.id === "typenote" ? typeArt(page) : product.art, product.name);
    return `<a class="exhibit exhibit-${product.id}" href="${escape(product.url)}" data-enter style="--enter-delay:${index % 2 * 80}ms"><div class="exhibit-copy">${image(product.icon, "", "exhibit-icon", index < 2)}<h3>${product.name}</h3><p>${copy.taglines[index]}</p><p class="exhibit-platform">${product.platform}</p><span class="exhibit-link">${copy.learn} <span aria-hidden="true">↗</span></span></div><div class="exhibit-art">${art}</div>${index === 0 || index === 4 ? dots : ""}</a>`;
  };
  const body = `<main id="main">
  <section class="studio-hero studio-shell"><div class="studio-hero-copy" data-enter><h1>${copy.hero}</h1><p>${copy.intro}</p><a class="studio-button" href="#apps">${copy.meet}<span aria-hidden="true">↗</span></a></div>
    <div class="studio-hero-canvas" aria-label="TypeNote &amp; ajigu"><span class="studio-disc" aria-hidden="true"></span><span class="studio-quarter" aria-hidden="true"></span>${dots}<div class="studio-hero-window">${image(typeArt(page), "TypeNote", "", true)}</div><div class="studio-plinth" aria-hidden="true"></div>${image("ajigu.png", "", "studio-hero-bird", true)}<button class="studio-hero-stamp" type="button" data-hero-toggle aria-pressed="false">TypeNote ↔ Moodsk</button></div></section>
  <section class="studio-beliefs" id="studio"><div class="studio-shell"><h2 data-enter>${copy.belief}</h2><div class="studio-belief-grid">${copy.values.map((value,index) => `<div class="studio-belief" data-enter style="--enter-delay:${index * 70}ms"><span class="studio-mark" aria-hidden="true"></span><div><h3>${value}</h3><p>${copy.valueDetails[index]}</p></div></div>`).join("")}</div></div></section>
  <section class="studio-work studio-shell" id="apps"><div class="studio-work-heading"><h2>${copy.work}</h2><p>${copy.workIntro}</p></div><div class="exhibition">${page.products.map(exhibit).join("\n")}</div></section>
  <section class="studio-close" id="contact"><div class="studio-shell studio-close-inner"><div><h2>ajigu</h2><p>${page.about}</p></div><div class="studio-close-links">${page.contactLinks}</div></div></section>
  </main><footer class="site-footer"><div class="studio-shell footer-inner"><p>© 2026 ajigu</p><div class="footer-links">${page.guideLinks}</div></div></footer>`;
  return shell(page, body, true);
}

export async function build() {
  const configurations = [site];
  for (const file of site.additional || []) configurations.push(JSON.parse(await readFile(path.join(directory, file), "utf8")));
  for (const configuration of configurations) {
    site = configuration;
    for (const page of site.pages) {
    const output = site.id === "studio" ? home(page) : product(page);
    const destination = path.join(root, page.file);
    if (check) {
      let existing = "";
      try { existing = await readFile(destination, "utf8"); } catch {}
      if (existing !== output) failures.push(page.file);
    } else {
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, output);
    }
    }
    console.log(`${check ? "Checked" : "Generated"} ${site.pages.length} ${site.name} pages.`);
  }
  if (failures.length) throw new Error(`Generated studio pages are stale: ${failures.join(", ")}`);
}

await build();

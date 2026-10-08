// Run browser integration checks separately from the dependency-free unit suite.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(process.argv[2] || fileURLToPath(new URL("../", import.meta.url)));
const output = process.env.TASK_ARTIFACT_DIR;
if (!output || !process.env.PLAYWRIGHT_MODULE) throw new Error("Set TASK_ARTIFACT_DIR and PLAYWRIGHT_MODULE.");
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const content = JSON.parse(await readFile(path.join(root, "studio/content.json"), "utf8"));
const pages = [...content.pages];
for (const file of content.additional || []) pages.push(...JSON.parse(await readFile(path.join(root, "studio", file), "utf8")).pages);
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); response.end(); return; }
  const file = path.resolve(root, `.${pathname}`, pathname.endsWith("/") ? "index.html" : "");
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  try { response.setHeader("content-type", mime[path.extname(file)] || "application/octet-stream"); response.end(await readFile(file)); }
  catch { response.writeHead(404); response.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

try {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  let errors = [];
  const fontRequests = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url()) || (request.resourceType() === "font" && new URL(request.url()).origin !== origin)) fontRequests.add(request.url());
  });
  for (const source of pages) {
    for (const width of [1440,768,390]) {
      errors = [];
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      const url = `${origin}${source.route}${source.locale.startsWith("en") ? "?lang=en" : ""}`;
      await page.goto(url, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main").length,
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        locale: document.documentElement.lang,
        brand: document.querySelector(".studio-brand")?.getAttribute("href"),
        sections: document.querySelectorAll("main section").length,
        text: document.querySelector("main")?.innerText.length || 0,
      }));
      assert.equal(metrics.h1,1,`${source.route}: H1 count`);
      assert.equal(metrics.main,1,`${source.route}: main count`);
      assert.ok(metrics.scroll <= metrics.width,`${source.route}@${width}: ${metrics.scroll}px overflow`);
      assert.equal(metrics.brand, source.route, `${source.route}: brand loses locale`);
      assert.ok(metrics.text > 250,`${source.route}: meaningful static content`);
      assert.ok(metrics.sections > 2,`${source.route}: content sections`);
      assert.deepEqual(errors, [], `${source.route}: runtime errors`);
      const missingAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
        .map((link) => link.getAttribute("href").slice(1))
        .filter((id) => id && !document.getElementById(decodeURIComponent(id))));
      assert.deepEqual(missingAnchors,[],`${source.route}: missing anchor targets`);
      if ((source.locale.startsWith("en") || source.locale === "zh-Hans") && [1440,390].includes(width)) {
        const slug = source.route.replaceAll("/", "-") || "home";
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            scrollTo(0,y);
            await new Promise((resolve) => setTimeout(resolve,80));
          }
          scrollTo(0,0);
          await Promise.all([...document.images].map((picture) => picture.decode().catch(() => {})));
        });
        const brokenImages = await page.evaluate(() => [...document.images].filter((picture) => !picture.naturalWidth).map((picture) => picture.src));
        assert.deepEqual(brokenImages,[],`${source.route}: broken product imagery`);
        await page.screenshot({ path: path.join(output,`${slug}-${width}.png`), fullPage: true, animations: "disabled" });
      }
      results.push({ route: source.route,width,...metrics,errors:[...errors] });
    }
  }
  assert.equal(fontRequests.size,0,`Unexpected third-party fonts: ${[...fontRequests]}`);

  await page.goto(`${origin}/?lang=en`, { waitUntil: "networkidle" });
  if (content.id === "studio") {
    assert.equal(await page.locator(".exhibit").count(),6);
    await page.locator("[data-hero-toggle]").click();
    assert.match(await page.locator(".studio-hero-window img").getAttribute("src"), /moodsk\.webp$/);
    await page.goto(`${origin}/nameplate/about/`, { waitUntil: "networkidle" });
    await page.locator("[data-name-input]").fill("<script>A & B</script>");
    assert.equal(await page.locator("[data-name-output]").textContent(),"<script>A & B</script>");
    assert.equal(await page.locator("[data-name-output] script").count(),0);
    await page.locator("[data-name-input]").fill("");
    assert.equal(await page.locator("[data-name-output]").textContent(),"Alex Chen");
    await page.goto(`${origin}/nameplate/`, { waitUntil:"networkidle" });
    assert.equal(await page.locator("#cardCanvas").getAttribute("width"),"2362");
    const downloadReady = page.waitForEvent("download");
    await page.locator("#downloadButton").click();
    const download = await downloadReady;
    const pngFile = path.join(output,"nameplate-export.png");
    await download.saveAs(pngFile);
    const png = await readFile(pngFile);
    assert.equal(png.subarray(1,4).toString(),"PNG");
    assert.equal(png.readUInt32BE(16),2362);
    assert.equal(png.readUInt32BE(20),2362);
    await page.goto(`${origin}/nameplate/zh-hans/`, { waitUntil:"networkidle" });
    assert.match(await page.locator("#downloadButton").textContent(),/[\u3400-\u9fff]/);
  }
  if (content.id === "typenote") {
    const sound = page.locator("[data-sound]");
    assert.equal(await sound.getAttribute("aria-pressed"),"false");
    await page.locator("[data-note-input]").fill("hello");
    assert.match(await page.locator("[data-note-output]").textContent(),/5$/);
    await sound.click();
    await page.waitForFunction(() => document.querySelector("[data-sound]").getAttribute("aria-pressed") === "true");
    assert.equal(await sound.getAttribute("aria-pressed"),"true");
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pagehide",{ persisted:true })));
    await sound.click();
    await page.waitForFunction(() => document.querySelector("[data-sound]").getAttribute("aria-pressed") === "true");
    assert.equal(await sound.getAttribute("aria-pressed"),"true");
    await page.locator(".langswitch-inline summary").click();
    await page.locator('.langswitch-inline [data-lang="zh"]').click();
    assert.equal(await page.locator('[data-copy="features"]').textContent(),"功能");
    assert.equal(await page.locator("html").getAttribute("lang"),"zh-Hans");
    assert.equal(await page.locator("[data-note-output]").textContent(),"音符 5");
    assert.equal(await page.locator(".studio-skip").textContent(),"跳到正文");
    assert.match(await page.locator("#faq summary").first().textContent(),/[\u3400-\u9fff]/);
    assert.equal(await page.locator('[data-copy="tryTitle"]').textContent(),"留一点空间，亲手试试。");
  }
  if (content.id === "gosleep") {
    await page.locator('[data-event="1"]').click();
    assert.equal(await page.locator("[data-event-title]").textContent(),"Possible sleep talking");
    assert.equal(await page.locator('[data-event="1"]').getAttribute("aria-pressed"),"true");
  }
  if (content.id === "dailyapod") {
    await page.locator('[data-view="1"]').click();
    assert.match(await page.locator("[data-gallery-image]").getAttribute("src"),/dailyapod-3\.webp$/);
    assert.equal(await page.locator("[data-gallery-image]").getAttribute("alt"),"Widgets");
  }
  if (content.id === "tutu") {
    await page.locator("[data-compare]").focus();
    await page.keyboard.press("End");
    assert.equal(await page.locator("[data-compare]").inputValue(),"100");
    assert.match(await page.locator("[data-compare-demo]").getAttribute("style"),/100%/);
  }
  await page.emulateMedia({ reducedMotion:"reduce" });
  await page.reload({ waitUntil:"networkidle" });
  assert.ok(await page.locator("h1").isVisible());
  assert.deepEqual(errors,[]);
  await context.close();

  const plain = await browser.newContext({ javaScriptEnabled:false, locale:"en-US", viewport:{width:390,height:844} });
  const plainPage = await plain.newPage();
  await plainPage.goto(`${origin}/?lang=en`);
  assert.ok(await plainPage.locator("h1").isVisible());
  assert.ok(await plainPage.locator("main a").count()>0);
  if (content.id === "moodsk") assert.ok(await plainPage.locator(".showcase-fallback").isVisible());
  await plain.close();
  await writeFile(path.join(output,"browser-results.json"),JSON.stringify({ site:content.id,results,fontRequests:[...fontRequests],interactions:"passed",reducedMotion:"passed",noJavaScript:"passed" },null,2));
  console.log(`${content.name}: ${results.length} page/viewport checks, interactions, reduced motion and no-JavaScript passed.`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

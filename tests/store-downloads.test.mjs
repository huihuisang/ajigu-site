import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
for (const [product, id, count] of [
  ["gosleep", "6799618137", 8],
  ["tutu", "6480340301", 5],
]) {
  test(`${product} offers the released app in every language`, async () => {
    const pages = JSON.parse(await read(`apps/ajigu/src/products/${product}/content/pages.json`));
    assert.equal(pages.length, count);
    for (const page of pages) {
      const url = new URL(page.actions[0].href);
      assert.equal(url.hostname, "apps.apple.com");
      assert.ok(url.pathname.endsWith(`/id${id}`));
      assert.doesNotMatch(JSON.stringify(page), /testflight|free beta|测试版|測試版|ベータ|베타/i);
      const app = page.metadata.structuredData.find(
        (entry) => entry["@type"] === "SoftwareApplication",
      );
      assert.equal(app.downloadUrl, page.actions[0].href);
      assert.ok(page.footerLinks.some((link) => link.href === page.actions[0].href));
    }
  });
}
test("TUTU release FAQ and structured data agree on paid photo saving", async () => {
  const pages = JSON.parse(await read("apps/ajigu/src/products/tutu/content/pages.json"));
  const saving = {
    en: /sav(?:e|ing) edited photos/i,
    "zh-Hans": /(?=.*保存)(?=.*照片)/,
    "zh-Hant": /(?=.*儲存)(?=.*照片)/,
    ja: /写真.*保存/,
    ko: /사진.*저장/,
  };
  for (const page of pages) {
    const answer = page.sections.find((entry) => entry.id === "faq").questions[0].answer;
    assert.match(answer, /Premium/);
    assert.match(answer, saving[page.locale]);
    const faq = page.metadata.structuredData.find((entry) => entry["@type"] === "FAQPage");
    assert.equal(faq.mainEntity[0].acceptedAnswer.text, answer.replace(/<[^>]*>/g, ""));
  }
  for (const file of ["apps/ajigu/public/tutu/404.html", "apps/ajigu/public/tutu/llms.txt"])
    assert.doesNotMatch(await read(file), /testflight|free beta/i);
});

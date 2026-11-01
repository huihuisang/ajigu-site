import assert from "node:assert/strict";
import test from "node:test";
import { productPath, migrateURL, migrateContent } from "../packages/site-kit/config/urls.mjs";

test("product paths preserve locale placement, query and fragments", () => {
  assert.equal(productPath("moodsk", "/zh-hans/tutorials/"), "/moodsk/zh-hans/tutorials/");
  assert.equal(productPath("dailyapod", "/guides/x/zh-hans/"), "/dailyapod/guides/x/zh-hans/");
  assert.equal(
    productPath("typenote", "/?lang=zh&ref=a%2Fb#faq"),
    "/typenote/?lang=zh&ref=a%2Fb#faq",
  );
  assert.equal(productPath("moodsk", "/moodsk/ja/"), "/moodsk/ja/");
});
test("first-party URL migration leaves shared, external and relative resources intact", () => {
  assert.equal(
    migrateURL("https://moodsk.ajigu.com/assets/icon.png", "ajigu"),
    "https://ajigu.com/moodsk/assets/icon.png",
  );
  assert.equal(migrateURL("/assets/icon.png", "moodsk"), "/moodsk/assets/icon.png");
  for (const value of [
    "#faq",
    "../assets/icon.png",
    "data:image/svg+xml,x",
    "/studio/icons/moodsk.webp",
    "https://apps.apple.com/app/1",
    "mailto:hi@example.com",
  ])
    assert.equal(migrateURL(value, "moodsk"), value);
  assert.equal(migrateURL("https://ajigu.com/", "moodsk"), "https://ajigu.com/");
});
test("structured metadata and trusted HTML use the same route mapping", () => {
  const result = migrateContent(
    {
      route: "/",
      metadata: { url: "https://gosleep.ajigu.com/privacy/" },
      body: '<p><a href="/support/#contact">Help</a><a href="https://typenote.ajigu.com/?lang=ja">TypeNote</a></p>',
    },
    "gosleep",
  );
  assert.equal(result.route, "/gosleep/");
  assert.equal(result.metadata.url, "https://ajigu.com/gosleep/privacy/");
  assert.match(result.body, /href="\/gosleep\/support\/#contact"/);
  assert.match(result.body, /https:\/\/ajigu.com\/typenote\/\?lang=ja/);
});

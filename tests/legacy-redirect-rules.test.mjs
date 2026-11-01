import assert from "node:assert/strict";
import test from "node:test";
import { legacyRedirectRules, expectedLegacyTarget } from "../scripts/legacy-redirect-rules.mjs";
import { legacySites } from "../packages/site-kit/config/urls.mjs";

test("edge redirects use six ordered rules with an exact five-host scope", () => {
  const rules = legacyRedirectRules();
  assert.equal(rules.length, 6);
  assert.match(rules[0].expression, /starts_with\(http.request.uri.path, "\/studio\/"\)/);
  for (const [index, { domain, base }] of Object.values(legacySites).entries()) {
    const rule = rules[index + 1];
    assert.equal(rule.expression, `(http.host eq "${domain}")`);
    assert.equal(
      rule.action_parameters.from_value.target_url.expression,
      `concat("https://ajigu.com${base}", http.request.uri.path)`,
    );
  }
  for (const rule of rules) {
    assert.equal(rule.action, "redirect");
    assert.equal(rule.enabled, true);
    assert.equal(rule.action_parameters.from_value.status_code, 301);
    assert.equal(rule.action_parameters.from_value.preserve_query_string, true);
    assert.doesNotMatch(rule.expression, /www\.ajigu\.com|http\.host eq "ajigu\.com"/);
  }
});

test("legacy navigation retains encoded and repeated query values and fragments", () => {
  for (const { domain, base } of Object.values(legacySites)) {
    for (const protocol of ["http", "https"]) {
      assert.equal(
        expectedLegacyTarget(
          `${protocol}://${domain}/zh-hans/?lang=zh&tag=a&tag=b&empty=&ref=a%2Fb#faq`,
        ),
        `https://ajigu.com${base}/zh-hans/?lang=zh&tag=a&tag=b&empty=&ref=a%2Fb#faq`,
      );
      assert.equal(
        expectedLegacyTarget(`${protocol}://${domain}/guides/keyboard-sounds/`),
        `https://ajigu.com${base}/guides/keyboard-sounds/`,
      );
    }
  }
});

test("shared resource paths stay at the main root while similar product paths do not", () => {
  for (const path of ["/studio", "/studio/icons/moodsk.png", "/licenses", "/licenses/MIT.txt"])
    assert.equal(
      expectedLegacyTarget(`https://moodsk.ajigu.com${path}`),
      `https://ajigu.com${path}`,
    );
  assert.equal(
    expectedLegacyTarget("https://moodsk.ajigu.com/studio-notes/"),
    "https://ajigu.com/moodsk/studio-notes/",
  );
  assert.equal(
    expectedLegacyTarget("https://moodsk.ajigu.com//example.com/path"),
    "https://ajigu.com/moodsk//example.com/path",
  );
  for (const url of [
    "https://ajigu.com/",
    "https://cake.ajigu.com/",
    "https://moodsk.ajigu.com.example.com/",
    "ftp://moodsk.ajigu.com/",
  ])
    assert.throws(() => expectedLegacyTarget(url));
});

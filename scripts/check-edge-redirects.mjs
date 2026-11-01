import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { expectedLegacyTarget } from "./legacy-redirect-rules.mjs";
import { legacySites } from "../packages/site-kit/config/urls.mjs";

export async function checkEdgeRedirects() {
  const cases = [];
  for (const [product, { domain }] of Object.entries(legacySites)) {
    const sitemap = await readFile(
      new URL(`../apps/ajigu/public/${product}/sitemap.xml`, import.meta.url),
      "utf8",
    );
    const $ = load(sitemap, { xml: true });
    for (const source of $("loc")
      .map((_, element) => $(element).text())
      .get())
      for (const protocol of ["http:", "https:"])
        cases.push({ source: source.replace(/^https?:/, protocol), kind: "page" });
    for (const protocol of ["http", "https"])
      cases.push({
        source: `${protocol}://${domain}/?lang=zh&tag=a&tag=b&empty=&ref=a%2Fb`,
        kind: "query",
      });
    const asset = product === "moodsk" ? "assets/appicon.jpg" : "assets/app-icon.png";
    cases.push({
      source: `https://${domain}/${asset}`,
      kind: "asset",
      file: `apps/ajigu/public/${product}/${asset}`,
    });
    cases.push({
      source: `https://${domain}/studio/icons/${product}.webp`,
      kind: "asset",
      file: `packages/site-kit/icons/${product}.webp`,
    });
  }
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (cursor < cases.length) {
        const entry = cases[cursor++];
        const expected = expectedLegacyTarget(entry.source);
        const response = await fetch(entry.source, {
          redirect: "manual",
          headers: { "cache-control": "no-cache", "user-agent": "ajigu-site-edge-verification" },
          signal: AbortSignal.timeout(45000),
        });
        assert.equal(response.status, 301, `${entry.source}: status ${response.status}`);
        assert.equal(response.headers.get("location"), expected, entry.source);
        assert.equal(response.headers.get("server"), "cloudflare", entry.source);
        assert.ok(response.headers.get("cf-ray"), entry.source);
        await response.arrayBuffer();
        const target = await fetch(expected, { signal: AbortSignal.timeout(45000) });
        assert.equal(target.status, 200, expected);
        const bytes = Buffer.from(await target.arrayBuffer());
        if (entry.file)
          assert.deepEqual(
            bytes,
            await readFile(new URL("../" + entry.file, import.meta.url)),
            expected,
          );
        results.push({
          source: entry.source,
          target: expected,
          kind: entry.kind,
          status: 301,
          edge: "cloudflare",
          targetStatus: 200,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        });
      }
    }),
  );
  const root = await fetch("https://ajigu.com/site-release.json", {
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(root.status, 200);
  const release = await root.json();
  assert.equal(release.site, "ajigu");
  assert.equal(release.mode, "site");
  assert.equal(release.sourceRepository, "huihuisang/ajigu-site");
  return {
    verifiedAt: new Date().toISOString(),
    complete: true,
    release,
    count: results.length,
    results: results.sort((a, b) => a.source.localeCompare(b.source)),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.env.TASK_ARTIFACT_DIR || process.argv.length !== 3)
    throw new Error("Run through task-artifacts and pass an evidence JSON path.");
  const result = await checkEdgeRedirects();
  await writeFile(process.argv[2], JSON.stringify(result, null, 2) + "\n");
  console.log(`${result.count} HTTP/HTTPS edge redirects and target resources passed.`);
}

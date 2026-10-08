import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";
import { publication, publicationTarget, assertRelease } from "../scripts/publish-products.mjs";

const revision = "a".repeat(40);
const marker = (site) => ({
  sourceRepository: publication.sourceRepository,
  sourceRevision: revision,
  site,
  domain: publicationTarget(site).domain,
});
test("publication targets are fixed and exclude the source repository", () => {
  assert.equal(Object.keys(publication.products).length, 5);
  assert.throws(() => publicationTarget("ajigu"));
  assert.throws(() => publicationTarget("unknown"));
  assert.equal(publicationTarget("moodsk").repository, "Ajigu-Studio/moodsk-website");
  for (const site of Object.keys(publication.products))
    assert.notEqual(publicationTarget(site).repository, publication.sourceRepository);
});
test("product publication rejects incorrect domains, revisions and source identity", () => {
  const good = marker("typenote");
  assertRelease("typenote", good.domain, good, revision);
  assert.throws(() => assertRelease("typenote", "ajigu.com", good, revision));
  for (const change of [
    { sourceRevision: "b".repeat(40) },
    { sourceRepository: "other/repo" },
    { site: "moodsk" },
    { domain: "moodsk.ajigu.com" },
  ])
    assert.throws(() => assertRelease("typenote", good.domain, { ...good, ...change }, revision));
  assert.throws(() => assertRelease("typenote", good.domain, good, "main"));
});
test("production Pages permissions are limited to the deployment job after verification", async () => {
  const source = await readFile(
    new URL("../.github/workflows/deploy-studio.yml", import.meta.url),
    "utf8",
  );
  const workflow = parse(source);
  assert.deepEqual(workflow.on.push.branches, ["main"]);
  assert.equal(workflow.on.pull_request, undefined);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  assert.equal(workflow.jobs.verify.uses, "./.github/workflows/build-websites.yml");
  assert.equal(workflow.jobs.deploy.needs, "verify");
  assert.equal(workflow.jobs.deploy.if, "github.ref == 'refs/heads/main'");
  assert.deepEqual(workflow.jobs.deploy.permissions, {
    contents: "read",
    pages: "write",
    "id-token": "write",
  });
  assert.equal(workflow.jobs.deploy.steps[0].with.name, "ajigu-com");
  assert.doesNotMatch(source, /secrets\./);
});

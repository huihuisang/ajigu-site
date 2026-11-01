import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";
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

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacySites, origin } from "../packages/site-kit/config/urls.mjs";

export const publication = JSON.parse(
  await readFile(new URL("../packages/site-kit/config/publication.json", import.meta.url), "utf8"),
);
export function publicationTarget(site) {
  if (!Object.hasOwn(publication.products, site)) throw new Error(`Unknown product: ${site}`);
  return {
    site,
    repository: publication.products[site],
    domain: legacySites[site].domain,
    base: legacySites[site].base,
    branch: publication.branch,
  };
}
function assertIdentity(site, cname, manifest, revision) {
  const target = publicationTarget(site);
  assert.match(revision, /^[a-f0-9]{40}$/);
  assert.equal(cname.trim(), target.domain, "Artifact CNAME does not match the target.");
  assert.equal(manifest.sourceRepository, publication.sourceRepository);
  assert.equal(manifest.sourceRevision, revision);
  assert.equal(manifest.site, site);
  assert.equal(manifest.domain, target.domain);
  return target;
}
export function assertRelease(site, cname, manifest, revision) {
  const target = assertIdentity(site, cname, manifest, revision);
  assert.equal(manifest.mode, "redirect");
  assert.equal(manifest.targetBase, origin + target.base + "/");
  return target;
}

function execute(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", ...options }).trim();
}
function api(endpoint, body, method = body ? "PUT" : "GET") {
  const response = execute(
    "gh",
    [
      "api",
      endpoint,
      ...(method !== "GET" ? ["--method", method] : []),
      ...(body ? ["--input", "-"] : []),
    ],
    body ? { input: JSON.stringify(body) } : {},
  );
  return response ? JSON.parse(response) : null;
}
async function publish() {
  const args = process.argv.slice(2);
  const option = (name) => args[args.indexOf(name) + 1];
  const revision = args.includes("--revision") ? option("--revision") : "";
  const runId = args.includes("--run") ? option("--run") : "";
  const apply = args.includes("--apply");
  if (!process.env.TASK_ARTIFACT_DIR || !/^[a-f0-9]{40}$/.test(revision) || !/^\d+$/.test(runId))
    throw new Error("Set TASK_ARTIFACT_DIR and pass --revision SHA --run ID [--apply].");
  const run = JSON.parse(
    execute("gh", [
      "run",
      "view",
      runId,
      "--repo",
      publication.sourceRepository,
      "--json",
      "headSha,headBranch,conclusion,workflowName",
    ]),
  );
  assert.equal(run.headSha, revision);
  assert.equal(run.headBranch, "main");
  assert.equal(run.conclusion, "success");
  assert.equal(run.workflowName, "Deploy studio website");
  assert.equal(
    api(`repos/${publication.sourceRepository}/git/ref/heads/main`).object.sha,
    revision,
    "Source main changed after CI.",
  );
  const output = await mkdtemp(path.join(process.env.TASK_ARTIFACT_DIR, "ci-artifacts-"));
  const plans = [];
  for (const site of Object.keys(publication.products)) {
    const source = path.join(output, site);
    execute("gh", [
      "run",
      "download",
      runId,
      "--repo",
      publication.sourceRepository,
      "--name",
      `${site}-redirects`,
      "--dir",
      source,
    ]);
    const manifest = JSON.parse(await readFile(path.join(source, "site-release.json"), "utf8"));
    const target = assertRelease(
      site,
      await readFile(path.join(source, "CNAME"), "utf8"),
      manifest,
      revision,
    );
    assert.ok(
      (await readFile(path.join(source, "index.html"), "utf8")).includes('http-equiv="refresh"'),
    );
    await readFile(path.join(source, ".nojekyll"));
    const pages = api(`repos/${target.repository}/pages`);
    assert.equal(pages.cname, target.domain, "Existing Pages domain does not match.");
    assert.equal(pages.build_type, "legacy");
    const refs = api(`repos/${target.repository}/git/matching-refs/heads/${target.branch}`);
    const ref = refs.find((item) => item.ref === `refs/heads/${target.branch}`);
    if (ref) {
      const previous = api(
        `repos/${target.repository}/contents/site-release.json?ref=${ref.object.sha}`,
      );
      const marker = JSON.parse(Buffer.from(previous.content, "base64").toString());
      assertIdentity(site, target.domain, marker, marker.sourceRevision);
    }
    plans.push({
      ...target,
      source,
      manifest,
      previousBranch: ref?.object.sha || null,
      previousPages: { build_type: pages.build_type, source: pages.source, cname: pages.cname },
    });
  }
  if (!apply) {
    console.log(JSON.stringify({ apply: false, revision, runId, plans }, null, 2));
    return;
  }
  const work = path.join(process.env.TASK_ARTIFACT_DIR, "publish");
  await mkdir(work, { recursive: true });
  const results = [];
  for (const plan of plans) {
    const staging = await mkdtemp(path.join(work, `${plan.site}-`));
    const jj = (...args) =>
      execute("jj", ["--config", "snapshot.max-new-file-size=100000000", ...args], {
        cwd: staging,
      });
    jj("git", "init", "--colocate");
    jj("git", "remote", "add", "origin", `https://github.com/${plan.repository}.git`);
    if (plan.previousBranch) {
      jj("git", "fetch", "--remote", "origin", "--branch", plan.branch);
      assert.equal(
        jj("log", "-r", `${plan.branch}@origin`, "--no-graph", "-T", "commit_id"),
        plan.previousBranch,
        "Publication branch changed after preflight.",
      );
      jj("bookmark", "track", `${plan.branch}@origin`);
      jj("new", `${plan.branch}@origin`);
      for (const name of await readdir(staging)) {
        if (![".git", ".jj"].includes(name))
          await rm(path.join(staging, name), { recursive: true, force: true });
      }
    }
    for (const name of await readdir(plan.source)) {
      if ([".git", ".jj", ".github"].includes(name))
        throw new Error("Artifact contains repository metadata.");
      await cp(path.join(plan.source, name), path.join(staging, name), { recursive: true });
    }
    jj("describe", "--message", `Publish ${plan.site} from ajigu-site ${revision}`);
    const commit = jj("log", "-r", "@", "--no-graph", "-T", "commit_id");
    jj("bookmark", "set", plan.branch, "-r", "@");
    jj("git", "push", "--remote", "origin", "--bookmark", plan.branch);
    assert.equal(api(`repos/${plan.repository}/git/ref/heads/${plan.branch}`).object.sha, commit);
    if (plan.previousPages.source.branch !== plan.branch || plan.previousPages.source.path !== "/")
      api(`repos/${plan.repository}/pages`, { source: { branch: plan.branch, path: "/" } });
    const pages = api(`repos/${plan.repository}/pages`);
    assert.equal(pages.source.branch, plan.branch);
    assert.equal(pages.cname, plan.domain);
    api(`repos/${plan.repository}/pages/builds`, undefined, "POST");
    results.push({
      site: plan.site,
      repository: plan.repository,
      branch: plan.branch,
      commit,
      sourceRevision: revision,
      runId,
      domain: plan.domain,
      previousBranch: plan.previousBranch,
      previousPages: plan.previousPages,
    });
    await writeFile(
      path.join(process.env.TASK_ARTIFACT_DIR, "publication-results.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
    console.log(`Published ${plan.site}: ${commit}`);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await publish();

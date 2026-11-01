import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { startPreview } from "../scripts/preview-workspace.mjs";

test("preview media supports complete, partial, suffix and HEAD requests", async (t) => {
  const directory = await mkdtemp(
    path.join(process.env.TASK_ARTIFACT_DIR || tmpdir(), "preview-media-"),
  );
  const asset = Buffer.from("0123456789abcdefghijklmnopqrstuvwxyz");
  await mkdir(path.join(directory, "ajigu"));
  await writeFile(path.join(directory, "ajigu/demo.mp4"), asset);
  const previous = process.env.STUDIO_OUTPUT_DIR;
  process.env.STUDIO_OUTPUT_DIR = directory;
  const preview = await startPreview({ ports: { ajigu: 0 }, quiet: true });
  t.after(async () => {
    await preview.close();
    if (previous === undefined) delete process.env.STUDIO_OUTPUT_DIR;
    else process.env.STUDIO_OUTPUT_DIR = previous;
  });
  const url = preview.origins.ajigu + "/demo.mp4";
  const full = await fetch(url);
  assert.equal(full.status, 200);
  assert.equal(full.headers.get("content-type"), "video/mp4");
  assert.equal(full.headers.get("accept-ranges"), "bytes");
  assert.equal(Number(full.headers.get("content-length")), asset.length);
  assert.deepEqual(Buffer.from(await full.arrayBuffer()), asset);
  for (const [range, start, end] of [
    ["bytes=10-19", 10, 19],
    ["bytes=30-", 30, 35],
    ["bytes=-5", 31, 35],
    ["bytes=30-99", 30, 35],
  ]) {
    const response = await fetch(url, { headers: { Range: range } });
    assert.equal(response.status, 206, range);
    assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${asset.length}`);
    assert.equal(Number(response.headers.get("content-length")), end - start + 1);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), asset.subarray(start, end + 1));
  }
  const head = await fetch(url, { method: "HEAD", headers: { Range: "bytes=0-9" } });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), String(asset.length));
  assert.equal(head.headers.get("content-range"), null);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const unsupported = await fetch(url, { headers: { Range: "frames=0-9" } });
  assert.equal(unsupported.status, 200);
  assert.equal(unsupported.headers.get("content-range"), null);
  assert.deepEqual(Buffer.from(await unsupported.arrayBuffer()), asset);
  for (const range of ["bytes=99-", "bytes=20-10", "bytes=-0", "bytes=bad", "bytes=0-1,4-5"]) {
    const response = await fetch(url, { headers: { Range: range } });
    assert.equal(response.status, 416, range);
    assert.equal(response.headers.get("content-range"), `bytes */${asset.length}`);
    await response.arrayBuffer();
  }
});

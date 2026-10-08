import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const targets = args.flatMap((arg, index) => arg === "--target" && args[index + 1] ? [path.resolve(args[index + 1], "studio")] : []);
const check = args.includes("--check");
const files = ["build.mjs", "copy.mjs", "runtime.mjs", "style.css"];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
if (!targets.length) throw new Error("Specify at least one existing product repository with --target.");
for (const target of targets) {
  const content = JSON.parse(await readFile(path.join(target, "content.json"), "utf8"));
  if (!["typenote", "gosleep", "dailyapod", "moodsk", "tutu"].includes(content.id)) throw new Error(`Unrecognized product repository: ${target}`);
  for (const file of files) {
    const bytes = await readFile(path.join(source, file));
    const destination = path.join(target, file);
    if (check) {
      if (digest(await readFile(destination)) !== digest(bytes)) throw new Error(`Shared file differs: ${destination}`);
    } else await writeFile(destination, bytes);
  }
  console.log(`${check ? "Checked" : "Synced"} shared design for ${content.name}.`);
}

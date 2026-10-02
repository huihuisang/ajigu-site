import { readFile, readdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const images = [];
for (const directory of ["assets", "nameplate/assets", "nameplate/assets/templates"]) {
  for (const filename of (await readdir(new URL(`${directory}/`, root))).sort()) {
    if (!filename.endsWith(".png")) continue;
    const source = `${directory}/${filename}`;
    const output = source.replace(/\.png$/, ".webp");
    const isTemplate = directory.endsWith("/templates");
    const options = isTemplate ? ["-q", "92", "-sharp_yuv"] : ["-lossless", "-exact"];
    const result = spawnSync("cwebp", ["-quiet", "-m", "6", "-metadata", "all", ...options, fileURLToPath(new URL(source, root)), "-o", fileURLToPath(new URL(output, root))], { encoding: "utf8" });
    if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
    const sourceBytes = (await readFile(new URL(source, root))).length;
    const outputBytes = (await readFile(new URL(output, root))).length;
    images.push({ source, output, encoding: isTemplate ? "quality-92" : "lossless", sourceBytes, outputBytes });
    console.log(`${output}: ${sourceBytes} -> ${outputBytes} bytes`);
  }
}
await writeFile(new URL("assets/image-sizes.json", root), JSON.stringify({ images }, null, 2) + "\n");

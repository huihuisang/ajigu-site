import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { sites, studioPaths, legacySites } from "../packages/site-kit/config/paths.mjs";
import { transformPublic, writeRedirects } from "./site-output.mjs";

export async function preparePublic(name) {
  const locations = studioPaths(name);
  const marker = path.join(locations.output, ".studio-output");
  await mkdir(locations.output, { recursive: true });
  let ownership;
  try {
    ownership = await readFile(marker, "utf8");
  } catch {
    if ((await readdir(locations.output)).length)
      throw new Error(`Refusing to reuse an unmanaged output directory: ${locations.output}`);
    ownership = locations.root;
    await writeFile(marker, ownership);
  }
  if (ownership !== locations.root) throw new Error("Output belongs to another checkout.");
  await rm(locations.public, { recursive: true, force: true });
  await mkdir(locations.public, { recursive: true });
  if (name === "ajigu") {
    for (const entry of [
      "assets",
      "nameplate",
      "CNAME",
      "BingSiteAuth.xml",
      "robots.txt",
      "sitemap.xml",
      "llms.txt",
      "404.html",
      "styles.css",
      "lang-kit.css",
      "lang-kit.js",
      "reveal.js",
      "006457a8747962bd1d5a650d6b9a5365.txt",
    ]) {
      await cp(path.join(locations.root, entry), path.join(locations.public, entry), {
        recursive: true,
        filter: (source) => !source.startsWith(path.join(locations.root, "nameplate/about")),
      });
    }
    await cp(
      path.join(locations.root, "apps/ajigu/public/gallery"),
      path.join(locations.public, "gallery"),
      { recursive: true },
    );
  } else {
    await cp(path.join(locations.root, `apps/${name}/public`), locations.public, {
      recursive: true,
    });
  }
  await cp(
    path.join(locations.root, "apps/ajigu/public/gallery"),
    path.join(locations.public, "studio/products"),
    { recursive: true },
  );
  await cp(
    path.join(locations.root, "design/mockups/screens"),
    path.join(locations.public, "studio/screens"),
    { recursive: true },
  );
  await writeFile(path.join(locations.public, ".nojekyll"), "");
  await cp(
    path.join(locations.root, "packages/site-kit/icons"),
    path.join(locations.public, "studio/icons"),
    { recursive: true, filter: (source) => !source.endsWith("sources.json") },
  );
  await cp(
    path.join(locations.root, "packages/ui/licenses"),
    path.join(locations.public, "licenses"),
    { recursive: true },
  );
  const catalog = JSON.parse(
    await readFile(path.join(locations.root, "packages/site-kit/media.json"), "utf8"),
  );
  for (const file of Object.keys(catalog)) {
    const destination = path.join(locations.public, "studio/media", file);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(locations.root, "packages/site-kit/media", file), destination);
  }
  for (const site of Object.keys(legacySites)) {
    await cp(
      path.join(locations.root, "apps/ajigu/public", site),
      path.join(locations.public, site),
      { recursive: true },
    );
    if (site === "typenote") continue;
    const contract = JSON.parse(
      await readFile(
        path.join(locations.root, `apps/ajigu/src/products/${site}/compatibility.json`),
        "utf8",
      ),
    );
    for (const file of Object.keys(contract.legacyStudio)) {
      const destination = path.join(locations.public, file);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(locations.root, file), destination);
    }
  }
  // ICO can carry the existing PNG without changing its pixels.
  const favicon = await readFile(path.join(locations.root, "assets/favicon.png"));
  const width = favicon.readUInt32BE(16),
    height = favicon.readUInt32BE(20);
  if (width > 256 || height > 256)
    throw new Error("Favicon dimensions exceed the ICO entry limit.");
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = width === 256 ? 0 : width;
  header[7] = height === 256 ? 0 : height;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(favicon.length, 14);
  header.writeUInt32LE(22, 18);
  await writeFile(path.join(locations.public, "favicon.ico"), Buffer.concat([header, favicon]));
  await transformPublic(locations.root, locations.public);
  if ((await readFile(path.join(locations.public, "CNAME"), "utf8")).trim() !== sites[name].domain)
    throw new Error(`Incorrect CNAME for ${name}`);
  return locations;
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code ?? signal}`)),
    );
    for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action = "build", selection = "ajigu"] = process.argv.slice(2);
  const names = selection === "all" ? Object.keys(sites) : [selection];
  if (!["build", "dev", "check"].includes(action)) throw new Error(`Unknown command: ${action}`);
  if (action === "dev" && names.length !== 1)
    throw new Error("Choose one dev site: pnpm dev <site>.");
  for (const name of names) {
    const locations = action === "check" ? studioPaths(name) : await preparePublic(name);
    await run(
      "pnpm",
      [
        "--filter",
        `@ajigu/${name}`,
        action,
        ...(action === "dev" ? ["--port", String(sites[name].port), "--ignore-lock"] : []),
      ],
      locations.root,
    );
    if (action === "build") {
      await rm(locations.site, { recursive: true, force: true });
      await cp(locations.stage, locations.site, { recursive: true });
      const revision = process.env.STUDIO_REVISION || process.env.GITHUB_SHA;
      if (revision) {
        if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error("Invalid source revision.");
        await writeFile(
          path.join(locations.site, "site-release.json"),
          JSON.stringify({
            sourceRepository: "huihuisang/ajigu-site",
            sourceRevision: revision,
            site: name,
            domain: sites[name].domain,
            mode: "site",
          }) + "\n",
        );
      }
      await writeRedirects(locations.root, locations.output, revision || null);
      console.log(`Collected ${name}: ${locations.site}`);
    }
  }
  if (action === "check") {
    for (const target of ["ui", "site-kit"])
      await run(
        "pnpm",
        ["exec", "tsc", "-p", `packages/${target}/tsconfig.json`],
        studioPaths("ajigu").root,
      );
  }
}

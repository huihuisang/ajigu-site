import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { sites, studioPaths } from "../packages/site-kit/config/paths.mjs";

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
  const compatibility = !["ajigu", "typenote"].includes(name)
    ? JSON.parse(
        await readFile(path.join(locations.root, `apps/${name}/compatibility.json`), "utf8"),
      )
    : undefined;
  // Retain the old public module URLs from one frozen source; new pages do not load them.
  for (const file of Object.keys(compatibility?.legacyStudio || {})) {
    const destination = path.join(locations.public, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(locations.root, file), destination);
  }
  const names =
    name === "ajigu"
      ? Object.keys(catalog)
      : name === "typenote"
        ? ["ajigu.webp", "typenote.webp", "typenote-en.webp", "typenote-ja.webp"]
        : compatibility.media;
  for (const file of names) {
    const destination = path.join(locations.public, "studio/media", file);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(locations.root, "packages/site-kit/media", file), destination);
  }
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
  const [action = "build", selection = "all"] = process.argv.slice(2);
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
          }) + "\n",
        );
      }
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

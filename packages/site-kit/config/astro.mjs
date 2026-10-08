import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { staticDirectoryIndexes } from "./static-indexes.mjs";
import { studioPaths } from "./paths.mjs";

export function studioConfig(name, site, configURL) {
  const paths = studioPaths(name);
  return defineConfig({
    root: fileURLToPath(new URL("./", configURL)),
    site,
    output: "static",
    trailingSlash: "always",
    publicDir: paths.public,
    // Astro moves prerender assets with rename; keep compiler staging on the source volume.
    outDir: paths.stage,
    cacheDir: path.join(paths.root, "node_modules/.cache/astro", name),
    integrations: [react()],
    vite: { plugins: [staticDirectoryIndexes(paths.public), tailwindcss()] },
    devToolbar: { enabled: false },
    server: { host: "127.0.0.1" },
  });
}

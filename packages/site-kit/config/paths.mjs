import { fileURLToPath } from "node:url";
import path from "node:path";
export { legacySites } from "./urls.mjs";

export const sites = {
  ajigu: { name: "ajigu", domain: "ajigu.com", port: 8770 },
};

export function studioPaths(site) {
  if (!Object.hasOwn(sites, site)) throw new Error(`Unknown site: ${site}`);
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const output = path.resolve(
    process.env.STUDIO_OUTPUT_DIR ||
      (process.env.TASK_ARTIFACT_DIR
        ? path.join(process.env.TASK_ARTIFACT_DIR, "dist")
        : path.join(root, "dist")),
  );
  return {
    root,
    output,
    public: path.join(output, "public", site),
    site: path.join(output, site),
    stage: path.join(root, "node_modules/.cache/studio-build", site),
  };
}

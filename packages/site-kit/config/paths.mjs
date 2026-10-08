import { fileURLToPath } from "node:url";
import path from "node:path";

export const sites = {
  ajigu: { name: "ajigu", domain: "ajigu.com", port: 8770 },
  moodsk: { name: "moodsk", domain: "moodsk.ajigu.com", port: 8771 },
  tutu: { name: "tutu", domain: "tutu.ajigu.com", port: 8772 },
  gosleep: { name: "gosleep", domain: "gosleep.ajigu.com", port: 8773 },
  dailyapod: { name: "dailyapod", domain: "dailyapod.ajigu.com", port: 8774 },
  typenote: { name: "typenote", domain: "typenote.ajigu.com", port: 8775 },
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

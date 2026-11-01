import { fileURLToPath } from "node:url";
import { legacySites, origin } from "../packages/site-kit/config/urls.mjs";

export function legacyRedirectRules() {
  const hosts = Object.values(legacySites)
    .map(({ domain }) => JSON.stringify(domain))
    .join(" ");
  const parameters = (expression) => ({
    from_value: { target_url: { expression }, status_code: 301, preserve_query_string: true },
  });
  return [
    {
      description: "Legacy apps: shared resources",
      expression: `(http.host in {${hosts}} and (http.request.uri.path eq "/studio" or starts_with(http.request.uri.path, "/studio/") or http.request.uri.path eq "/licenses" or starts_with(http.request.uri.path, "/licenses/")))`,
      action: "redirect",
      action_parameters: parameters(`concat("${origin}", http.request.uri.path)`),
      enabled: true,
    },
    ...Object.entries(legacySites).map(([product, { domain, base }]) => ({
      description: `Legacy app: ${product}`,
      expression: `(http.host eq "${domain}")`,
      action: "redirect",
      action_parameters: parameters(`concat("${origin}${base}", http.request.uri.path)`),
      enabled: true,
    })),
  ];
}

export function expectedLegacyTarget(value) {
  const url = new URL(value);
  const site = Object.values(legacySites).find(({ domain }) => domain === url.hostname);
  if (!site || !["http:", "https:"].includes(url.protocol))
    throw new Error("Only the five legacy HTTP hosts are supported.");
  const shared = /^\/(?:studio|licenses)(?:\/|$)/.test(url.pathname);
  return origin + (shared ? "" : site.base) + url.pathname + url.search + url.hash;
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(legacyRedirectRules(), null, 2));

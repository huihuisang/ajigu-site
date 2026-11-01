export const origin = "https://ajigu.com";
export const legacySites = {
  typenote: { domain: "typenote.ajigu.com", base: "/typenote", port: 8775 },
  moodsk: { domain: "moodsk.ajigu.com", base: "/moodsk", port: 8771 },
  gosleep: { domain: "gosleep.ajigu.com", base: "/gosleep", port: 8773 },
  dailyapod: { domain: "dailyapod.ajigu.com", base: "/dailyapod", port: 8774 },
  tutu: { domain: "tutu.ajigu.com", base: "/tutu", port: 8772 },
};
/** @param {string} site @param {string} [value] */
export function productPath(site, value = "/") {
  if (site !== "ajigu" && !Object.hasOwn(legacySites, site))
    throw new Error(`Unknown product: ${site}`);
  if (site === "ajigu") return value;
  if (
    Object.values(legacySites).some(
      ({ base }) =>
        value === base ||
        value.startsWith(base + "/") ||
        value.startsWith(base + "?") ||
        value.startsWith(base + "#"),
    )
  )
    return value;
  return legacySites[site].base + (value.startsWith("/") ? value : "/" + value);
}
/** @param {string} value @param {string} [site] */
export function migrateURL(value, site = "ajigu") {
  if (/^https?:\/\//i.test(value)) {
    let url;
    try {
      url = new URL(value);
    } catch {
      return value;
    }
    const product = Object.keys(legacySites).find(
      (key) => legacySites[key].domain === url.hostname,
    );
    return product ? origin + productPath(product, url.pathname + url.search + url.hash) : value;
  }
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  if (/^\/(?:studio|licenses)(?:\/|$)/.test(value)) return value;
  return productPath(site, value);
}
/** @param {string} text @param {string} site */
export function migrateText(text, site) {
  return text
    .replace(/https?:\/\/[^\s<>"'`)\]]+/g, (value) => migrateURL(value, site))
    .replace(
      /\b(href|src|poster|action)=(['"])([^'"]*)\2/g,
      (_, key, quote, value) => `${key}=${quote}${migrateURL(value, site)}${quote}`,
    );
}
/** @template T @param {T} value @param {string} [site] @returns {T} */
export function migrateContent(value, site = "ajigu") {
  if (typeof value === "string")
    return /** @type {T} */ (
      /^(?:https?:\/\/|\/)[^\s<>]*$/.test(value)
        ? migrateURL(value, site)
        : migrateText(value, site)
    );
  if (Array.isArray(value))
    return /** @type {T} */ (value.map((item) => migrateContent(item, site)));
  if (value && typeof value === "object")
    return /** @type {T} */ (
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, migrateContent(item, site)]),
      )
    );
  return value;
}

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sites, studioPaths } from "../packages/site-kit/config/paths.mjs";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".csv": "text/csv",
  ".woff2": "font/woff2",
};
const navigation = (mapping) =>
  `<script data-studio-preview>document.addEventListener("click",function(event){var link=event.target.closest&&event.target.closest("a[href]");if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;var url=new URL(link.href,location.href);var targets=${JSON.stringify(mapping)};if(targets[url.hostname])link.href=targets[url.hostname]+url.pathname+url.search+url.hash;},true);</script>`;

export async function startPreview({ names = Object.keys(sites), ports = {}, quiet = false } = {}) {
  const origins = {},
    mapping = {},
    servers = [];
  try {
    for (const name of names) {
      const site = sites[name],
        root = studioPaths(name).site;
      const server = createServer(async (request, response) => {
        let pathname;
        try {
          pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        } catch {
          response.writeHead(400);
          response.end("Invalid URL");
          return;
        }
        const target = path.resolve(root, `.${pathname}`);
        if (
          (target !== root && !target.startsWith(root + path.sep)) ||
          pathname.split("/").some((part) => part.startsWith("."))
        ) {
          response.writeHead(403);
          response.end();
          return;
        }
        try {
          const file = (await stat(target)).isDirectory()
            ? path.join(target, "index.html")
            : target;
          response.setHeader(
            "content-type",
            mime[path.extname(file)] || "application/octet-stream",
          );
          response.setHeader("cache-control", "no-store");
          if (file.endsWith(".html")) {
            let html = await readFile(file, "utf8");
            response.end(html.replace("</body>", navigation(mapping) + "</body>"));
          } else
            createReadStream(file)
              .on("error", () => response.destroy())
              .pipe(response);
        } catch {
          response.writeHead(404);
          response.end("Not found");
        }
      });
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(ports[name] ?? site.port, "127.0.0.1", resolve);
      });
      servers.push(server);
      origins[name] = `http://127.0.0.1:${server.address().port}`;
      mapping[site.domain] = origins[name];
      if (!quiet) console.log(`${site.domain}: ${origins[name]}/`);
    }
    return {
      origins,
      close: () =>
        Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve)))),
    };
  } catch (error) {
    servers.forEach((server) => server.close());
    throw error;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const selected = process.argv.slice(2);
  const preview = await startPreview({ names: selected.length ? selected : undefined });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => void preview.close());
}

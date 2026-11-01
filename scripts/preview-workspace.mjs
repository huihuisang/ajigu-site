import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sites, studioPaths, legacySites } from "../packages/site-kit/config/paths.mjs";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".csv": "text/csv",
  ".woff2": "font/woff2",
};
const navigation = (mapping) =>
  `<script data-studio-preview>document.addEventListener("click",function(event){var link=event.target.closest&&event.target.closest("a[href]");if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;var url=new URL(link.href,location.href);var targets=${JSON.stringify(mapping)};if(targets[url.hostname])link.href=targets[url.hostname]+url.pathname+url.search+url.hash;},true);</script>`;

export async function startPreview({
  names = Object.keys(sites),
  ports = {},
  quiet = false,
  redirects = false,
} = {}) {
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
          } else {
            const { size } = await stat(file);
            let start = 0;
            let end = size - 1;
            response.setHeader("accept-ranges", "bytes");
            if (request.headers.range) {
              const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
              let valid = !!match && !!(match[1] || match[2]) && size > 0;
              if (valid) {
                const first = Number(match[1]);
                const last = Number(match[2]);
                valid = Number.isSafeInteger(first) && Number.isSafeInteger(last);
                if (!match[1]) {
                  valid &&= last > 0;
                  start = Math.max(0, size - last);
                } else {
                  start = first;
                  end = match[2] ? Math.min(last, size - 1) : size - 1;
                }
                valid &&= start < size && start <= end;
              }
              if (!valid) {
                response.writeHead(416, { "content-range": `bytes */${size}` });
                response.end();
                return;
              }
              response.writeHead(206, {
                "content-range": `bytes ${start}-${end}/${size}`,
                "content-length": end - start + 1,
              });
            } else {
              response.setHeader("content-length", size);
            }
            if (request.method === "HEAD" || size === 0) {
              response.end();
              return;
            }
            const stream = createReadStream(file, { start, end });
            response.on("close", () => stream.destroy());
            stream.on("error", () => response.destroy()).pipe(response);
          }
        } catch {
          response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
          response.end(await readFile(path.join(root, "404.html"), "utf8"));
        }
      });
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(ports[name] ?? site.port, "127.0.0.1", resolve);
      });
      servers.push(server);
      origins[name] = `http://127.0.0.1:${server.address().port}`;
      mapping[site.domain] = origins[name];
      if (name === "ajigu")
        for (const [product, legacy] of Object.entries(legacySites))
          origins[product] = origins[name] + legacy.base;
      if (!quiet) console.log(`${site.domain}: ${origins[name]}/`);
    }
    const redirectOrigins = {};
    if (redirects) {
      for (const [product] of Object.entries(legacySites)) {
        const directory = path.join(studioPaths("ajigu").output, "redirects", product);
        const server = createServer(async (request, response) => {
          let pathname;
          try {
            pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
          } catch {
            response.writeHead(400).end();
            return;
          }
          const target = path.resolve(directory, `.${pathname}`);
          if (!target.startsWith(directory + path.sep) && target !== directory) {
            response.writeHead(403).end();
            return;
          }
          let file;
          try {
            file = (await stat(target)).isDirectory() ? path.join(target, "index.html") : target;
            await stat(file);
          } catch {
            file = path.join(directory, "404.html");
            response.statusCode = 404;
          }
          response.setHeader(
            "content-type",
            mime[path.extname(file)] || "application/octet-stream",
          );
          response.end(await readFile(file));
        });
        await new Promise((resolve, reject) => {
          server.once("error", reject);
          server.listen(0, "127.0.0.1", resolve);
        });
        servers.push(server);
        redirectOrigins[product] = `http://127.0.0.1:${server.address().port}`;
      }
    }
    return {
      origins,
      redirectOrigins,
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

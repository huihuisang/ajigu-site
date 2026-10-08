import { readFile } from "node:fs/promises";
import path from "node:path";

// Vite serves exact public file paths. Preserve the old directory URLs during development too.
export function staticDirectoryIndexes(publicDirectory) {
  return {
    name: "studio-static-directory-indexes",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        let pathname;
        try {
          pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        } catch {
          response.statusCode = 400;
          response.end("Invalid URL");
          return;
        }
        if (!pathname.endsWith("/") || pathname.split("/").some((part) => part.startsWith("."))) {
          next();
          return;
        }
        const file = path.resolve(publicDirectory, `.${pathname}`, "index.html");
        if (!file.startsWith(publicDirectory + path.sep)) {
          next();
          return;
        }
        try {
          const html = await readFile(file);
          response.setHeader("content-type", "text/html; charset=utf-8");
          response.setHeader("cache-control", "no-store");
          response.end(html);
        } catch (error) {
          if (error.code === "ENOENT" || error.code === "ENOTDIR") next();
          else next(error);
        }
      });
    },
  };
}

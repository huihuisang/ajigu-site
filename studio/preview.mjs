import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const basePort = portIndex < 0 ? 8770 : Number(args[portIndex + 1]);
const roots = [path.dirname(path.dirname(fileURLToPath(import.meta.url)))];
args.forEach((arg,index) => { if (arg === "--site" && args[index + 1]) roots.push(path.resolve(args[index + 1])); });
const sites = await Promise.all(roots.map(async (root,index) => ({ root,port:basePort+index,host:(await readFile(path.join(root,"CNAME"),"utf8")).trim() })));
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript", ".mjs":"text/javascript", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".csv":"text/csv" };
const servers = [];
for (const site of sites) {
  const server = createServer(async (request,response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url,"http://localhost").pathname); }
    catch { response.writeHead(400); response.end("Invalid URL"); return; }
    const target = path.resolve(site.root,`.${pathname}`);
    if ((target !== site.root && !target.startsWith(site.root+path.sep)) || /\/(?:\.git|\.jj|docs-ai|memory)(?:\/|$)/.test(pathname)) { response.writeHead(403); response.end(); return; }
    try {
      const file = (await stat(target)).isDirectory() ? path.join(target,"index.html") : target;
      response.setHeader("content-type",mime[path.extname(file)] || "application/octet-stream");
      response.setHeader("cache-control","no-store");
      if (file.endsWith(".html")) {
        let html = await readFile(file,"utf8");
        for (const other of sites) html = html.replaceAll(`https://${other.host}/`,`http://127.0.0.1:${other.port}/`);
        response.end(html);
      } else createReadStream(file).on("error",() => response.destroy()).pipe(response);
    } catch { response.writeHead(404); response.end("Not found"); }
  });
  await new Promise((resolve,reject) => { server.once("error",reject); server.listen(site.port,"127.0.0.1",resolve); });
  servers.push(server);
  console.log(`${site.host}: http://127.0.0.1:${site.port}/`);
}
process.on("SIGINT",() => { servers.forEach((server) => server.close()); });
process.on("SIGTERM",() => { servers.forEach((server) => server.close()); });

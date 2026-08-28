/* Statisk webserver til Firebase App Hosting.
 * Ingen afhængigheder — serverer filerne i public/ og lytter på $PORT.
 */
const http = require("http");
const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "public");
const PORT = process.env.PORT || 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".webmanifest": "application/manifest+json"
};

// index.html må ikke caches, så en ny udgivelse slår igennem med det samme
function cacheFor(file){
  return path.basename(file) === "index.html" ? "no-cache" : "public, max-age=3600";
}

const server = http.createServer((req, res) => {
  if(req.method !== "GET" && req.method !== "HEAD"){
    res.writeHead(405, {"Allow": "GET, HEAD"});
    return res.end("Method Not Allowed");
  }

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch(e){ res.writeHead(400); return res.end("Bad Request"); }

  if(pathname.endsWith("/")) pathname += "index.html";

  // løs stien inde i public/ og afvis alt der peger udenfor
  const file = path.join(ROOT, path.normalize(pathname));
  if(file !== ROOT && !file.startsWith(ROOT + path.sep)){
    res.writeHead(403); return res.end("Forbidden");
  }

  fs.stat(file, (err, st) => {
    // ukendte stier falder tilbage til appen, så dybe links virker
    const target = (err || !st.isFile()) ? path.join(ROOT, "index.html") : file;
    fs.readFile(target, (err2, buf) => {
      if(err2){ res.writeHead(404); return res.end("Not Found"); }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(target).toLowerCase()] || "application/octet-stream",
        "Content-Length": buf.length,
        "Cache-Control": cacheFor(target),
        "X-Content-Type-Options": "nosniff"
      });
      res.end(req.method === "HEAD" ? undefined : buf);
    });
  });
});

server.listen(PORT, () => console.log("Himmerland golf kører på port " + PORT));

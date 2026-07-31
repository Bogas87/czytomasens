import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(dirname, "dist");
const indexPath = path.join(distDir, "index.html");
const metaPath = path.join(distDir, "route-meta.json");
const app = express();
const port = Number(process.env.PORT) || 8080;
const canonicalOrigin = "https://czytomasens.pl";

const baseHtml = fs.readFileSync(indexPath, "utf8");
const routeMeta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizePath(value) {
  if (!value || value === "/") return "/";
  return value.replace(/\/+$/, "") || "/";
}

function replaceMeta(html, attribute, key, value) {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, "i");
  const replacement = `<meta ${attribute}="${key}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
}

function render(meta, route, status = 200) {
  const canonical = `${canonicalOrigin}${route === "/" ? "/" : route}`;
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);

  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceMeta(html, "name", "robots", status === 404 ? "noindex,follow" : "index,follow");
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  html = replaceMeta(html, "property", "og:type", meta.type || "website");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);

  return { html, status };
}

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(":")[0].toLowerCase();
  if (host === "www.czytomasens.pl") {
    return res.redirect(308, `${canonicalOrigin}${req.originalUrl}`);
  }
  return next();
});

app.use(express.static(distDir, {
  index: false,
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  },
}));

app.use((req, res) => {
  const route = normalizePath(req.path);
  const meta = routeMeta[route];

  if (meta) {
    const page = render(meta, route);
    return res.status(page.status).type("html").set("Cache-Control", "no-cache").send(page.html);
  }

  const page = render({
    title: "Nie znaleziono strony | CzyToMaSens",
    description: "Ta strona nie istnieje. Wróć do strony głównej CzyToMaSens.",
    type: "website",
  }, route, 404);
  return res.status(404).type("html").set("Cache-Control", "no-cache").send(page.html);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`CzyToMaSens frontend działa na porcie ${port}`);
});

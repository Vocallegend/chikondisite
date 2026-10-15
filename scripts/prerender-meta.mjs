/**
 * Static SEO prerender.
 *
 * The site is a client-side Vite SPA, so the HTML file Vercel serves for a URL
 * contains no page-specific metadata unless we write it there. Social scrapers
 * and many crawlers do not run JavaScript, which would otherwise leave every
 * page with the homepage title and description.
 *
 * After `vite build`, for every route in src/data/seo-routes.json this writes
 * `dist/<route>/index.html` — the same app shell with the right <title>,
 * description, canonical and Open Graph tags baked in. Vercel serves those
 * static files; the SPA then hydrates normally.
 *
 * It also emits dist/sitemap.xml and dist/robots.txt from the same route list,
 * using SITE_URL (or the Vercel-injected production URL). It never invents a
 * domain: without one it emits root-relative canonicals and says so.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const website = resolve(here, "..");
const dist = resolve(website, "dist");
const routesFile = resolve(website, "src/data/seo-routes.json");

function normaliseUrl(value) {
  if (!value) return "";
  let url = value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  return url;
}

const siteUrl = normaliseUrl(
  process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "",
);

const { routes } = JSON.parse(await readFile(routesFile, "utf8"));
const shell = await readFile(resolve(dist, "index.html"), "utf8");

const OG_IMAGE = "/brand/og-image.png";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolute(path) {
  return siteUrl ? `${siteUrl}${path}` : path;
}

/** Replace an existing tag by regex, or insert one before </head>. */
function upsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

function renderHead(html, route) {
  const canonical = absolute(route.path);
  const ogImage = siteUrl ? `${siteUrl}${OG_IMAGE}` : OG_IMAGE;

  let out = upsert(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  out = upsert(
    out,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
  );
  out = upsert(
    out,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
  for (const [attr, value] of [
    ["og:url", canonical],
    ["og:title", route.title],
    ["og:description", route.description],
    ["og:image", ogImage],
    ["twitter:title", route.title],
    ["twitter:description", route.description],
    ["twitter:image", ogImage],
  ]) {
    const prop = attr.startsWith("twitter") ? "name" : "property";
    out = upsert(
      out,
      new RegExp(`<meta ${prop}="${attr}" content="[^"]*"\\s*\\/?>`),
      `<meta ${prop}="${attr}" content="${escapeHtml(value)}" />`,
    );
  }
  return out;
}

for (const route of routes) {
  const html = renderHead(shell, route);
  const target = route.path === "/" ? resolve(dist, "index.html") : resolve(dist, route.path.slice(1), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${escapeHtml(absolute(r.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.path === "/" || r.path === "/download" ? "weekly" : "monthly"}</changefreq>\n    <priority>${r.priority ?? "0.5"}</priority>\n  </url>`,
  )
  .join("\n");
await writeFile(
  resolve(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  "utf8",
);

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/",
  "",
  siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : "# Set SITE_URL to publish an absolute sitemap URL.",
  "",
].join("\n");
await writeFile(resolve(dist, "robots.txt"), robots, "utf8");

console.log(
  `prerendered ${routes.length} routes (site url: ${siteUrl || "not configured — canonicals are root-relative"})`,
);

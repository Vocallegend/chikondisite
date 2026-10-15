/**
 * One-off asset preparation for the website.
 *
 * Copies the real Chikondi brand assets out of the member app (logo + the
 * onboarding / chat artwork that ships inside the APK) into `public/`, at sizes
 * the web can actually afford. Run once; the output is committed.
 *
 *   node website/scripts/prepare-assets.mjs
 *
 * `sharp` is resolved from the repository root's node_modules (Node walks up),
 * so this script does not add an image dependency to the website project.
 */
import { mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..");
const out = resolve(here, "..", "public");

const jobs = [
  // Real logo -> web-sized PNGs + a square app icon.
  {
    from: "public/chikondi-logo.png",
    to: "brand/chikondi-logo.png",
    resize: { width: 512 },
    png: { compressionLevel: 9, palette: true },
  },
  {
    from: "public/chikondi-logo.png",
    to: "brand/chikondi-logo-256.png",
    resize: { width: 256 },
    png: { compressionLevel: 9, palette: true },
  },
  {
    from: "public/chikondi-logo.png",
    to: "brand/app-icon-512.png",
    resize: { width: 512, height: 512, fit: "contain", background: "#0b1120" },
    png: { compressionLevel: 9 },
  },
  // Real in-app artwork, copied at their shipped resolution.
  { from: "src/assets/onboarding/welcome.jpg", to: "app/welcome.jpg", copy: true },
  { from: "src/assets/onboarding/connect-safely.jpg", to: "app/connect-safely.jpg", copy: true },
  { from: "src/assets/onboarding/what-to-expect.jpg", to: "app/what-to-expect.jpg", copy: true },
  { from: "src/assets/chat/chats.jpg", to: "app/chats.jpg", resize: { width: 720 }, jpeg: { quality: 82, mozjpeg: true } },
  // Favicons derived from the app icon.
  { from: "public/icon-192.png", to: "icon-192.png", copy: true },
  { from: "public/icon-512.png", to: "icon-512.png", copy: true },
  { from: "public/apple-touch-icon.png", to: "apple-touch-icon.png", copy: true },
  { from: "public/favicon.ico", to: "favicon.ico", copy: true },
];

for (const job of jobs) {
  const src = resolve(repo, job.from);
  const dest = resolve(out, job.to);
  await mkdir(dirname(dest), { recursive: true });
  if (job.copy) {
    await copyFile(src, dest);
    continue;
  }
  let pipe = sharp(src);
  if (job.resize) pipe = pipe.resize(job.resize);
  if (job.png) pipe = pipe.png(job.png);
  if (job.jpeg) pipe = pipe.jpeg(job.jpeg);
  await pipe.toFile(dest);
  console.log("wrote", job.to);
}

console.log("assets ready in", out);

// ---------------------------------------------------------------------------
// Open Graph / social share image.
//
// Drawn from the real brand colour and name only — no invented screenshots or
// statistics. 1200x630 is the size every major scraper expects.
// ---------------------------------------------------------------------------
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#ff3b53" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#ff3b53" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ff3b53" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0f1a"/>
      <stop offset="100%" stop-color="#141a2b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96 190)">
    <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="700" fill="#ffffff">Chikondi</text>
    <text x="4" y="82" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="400" fill="#c7cede">Real connections start here.</text>
    <rect x="4" y="132" width="132" height="8" rx="4" fill="#ff3b53"/>
    <text x="4" y="204" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="400" fill="#8b93a7">Official Android app &amp; download</text>
  </g>
  <g transform="translate(948 250)">
    <circle cx="0" cy="0" r="120" fill="#ff3b53" fill-opacity="0.12"/>
    <path d="M0 62 C-6 40 -70 8 -70 -34 C-70 -66 -44 -86 -18 -86 C-6 -86 4 -80 12 -70 C20 -80 30 -86 42 -86 C68 -86 94 -66 94 -34 C94 8 6 40 0 62 Z"
      transform="translate(-12 12) scale(1.35)" fill="#ff3b53"/>
  </g>
</svg>`;

await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(resolve(out, "brand/og-image.png"));
console.log("wrote brand/og-image.png");


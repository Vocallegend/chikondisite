/**
 * Publish an Android APK to this website.
 *
 *   npm run release:publish -- --apk ../android/app/build/outputs/apk/release/chikondi.apk --version 1.0.2 --code 3
 *
 * What it does (every fact comes from the file itself — nothing is guessed):
 *   1. Copies the APK into `public/downloads/chikondi-<version>.apk`, where the
 *      site serves it directly. No external storage, no separate host.
 *   2. Records the release in `src/data/release.json` with a site-relative
 *      `downloadUrl`, so the Download page and /api/releases/latest both point
 *      at the uploaded file.
 *
 * The stable link `/downloads/chikondi.apk` keeps working: it redirects to the
 * newest published APK. Older versions stay on disk, so a rollback is just a
 * matter of republishing an older file.
 *
 * Options:
 *   --apk <path>      The .apk to publish (required).
 *   --version <v>     Version name, e.g. 1.0.2. Defaults to the version found in
 *                     the file name (CHIKONDI-1.0.2.apk -> 1.0.2).
 *   --code <n>        versionCode. Defaults to the previous release's code.
 *   --min-api <n>     Minimum Android API level. Defaults to the previous one.
 *   --notes "a;b"     Release notes, semicolon-separated. Otherwise read from
 *                     src/data/release-notes.json for this version.
 *   --unpublished     Record it but do not mark it published.
 */
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const website = resolve(here, "..");
const manifestPath = join(website, "src/data/release.json");
const notesPath = join(website, "src/data/release-notes.json");
const downloadsDir = join(website, "public/downloads");

/** Android API level -> marketing version, for the human-readable field. */
const API_TO_VERSION = {
  21: "5.0",
  22: "5.1",
  23: "6.0",
  24: "7.0",
  25: "7.1",
  26: "8.0",
  27: "8.1",
  28: "9",
  29: "10",
  30: "11",
  31: "12",
  32: "12L",
  33: "13",
  34: "14",
  35: "15",
  36: "16",
};

const EMPTY_MANIFEST = {
  app: "Chikondi",
  packageId: "zm.chikondi.app",
  channel: "stable",
  releases: [],
};

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return null;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function sha256(file) {
  const buf = await readFile(file);
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

/** Pull `1.0.2` out of `CHIKONDI-1.0.2.apk` (or any `*-1.0.2.apk`). */
function versionFromName(file) {
  const match = /(\d+(?:\.\d+)+)/.exec(basename(file));
  return match ? match[1] : null;
}

const apkArg = flag("apk");
if (!apkArg || apkArg === true) {
  fail(
    "pass the APK to publish, e.g. --apk ../android/app/build/outputs/apk/release/chikondi.apk",
  );
}
const apkPath = resolve(process.cwd(), apkArg);
if (!existsSync(apkPath)) fail(`APK not found: ${apkPath}`);

const versionArg = flag("version");
const version = (typeof versionArg === "string" ? versionArg : null) ?? versionFromName(apkPath);
if (!version || !/^\d+(\.\d+){0,3}$/.test(version)) {
  fail(
    "could not determine the version — pass --version (e.g. 1.0.2); the file name did not contain one",
  );
}

const manifest = await readJson(manifestPath, EMPTY_MANIFEST);
manifest.releases = Array.isArray(manifest.releases) ? manifest.releases : [];
const previous = manifest.releases.find((r) => r.published) ?? manifest.releases[0] ?? null;

const codeArg = flag("code");
const versionCode = Number(
  typeof codeArg === "string" ? codeArg : (previous?.versionCode ?? 0),
);
if (!Number.isInteger(versionCode) || versionCode < 0) {
  fail("--code must be a non-negative integer");
}

const minApiArg = flag("min-api");
const minimumAndroidApi = Number(
  typeof minApiArg === "string" ? minApiArg : (previous?.minimumAndroidApi ?? 24),
);
const minimumAndroidVersion =
  API_TO_VERSION[minimumAndroidApi] ?? String(minimumAndroidApi);

let releaseNotes = [];
const notesArg = flag("notes");
if (typeof notesArg === "string") {
  releaseNotes = notesArg
    .split(";")
    .map((note) => note.trim())
    .filter(Boolean);
} else {
  const notesByVersion = await readJson(notesPath, {});
  const entry = notesByVersion?.[version];
  if (Array.isArray(entry)) releaseNotes = entry.map(String);
}

const info = await stat(apkPath);
const digest = await sha256(apkPath);
const fileName = `chikondi-${version}.apk`;
const published = flag("unpublished") !== true;

await mkdir(downloadsDir, { recursive: true });
await copyFile(apkPath, join(downloadsDir, fileName));

const release = {
  versionCode,
  versionName: version,
  published,
  releaseDate: info.mtime.toISOString().slice(0, 10),
  builtAt: info.mtime.toISOString(),
  fileName,
  fileSize: info.size,
  sha256: digest,
  minimumAndroidApi,
  minimumAndroidVersion,
  releaseNotes,
  // Hosted by this site. /downloads/chikondi.apk redirects to the newest of these.
  downloadUrl: `/downloads/${fileName}`,
};

const index = manifest.releases.findIndex((r) => r.versionName === version);
if (index >= 0) manifest.releases[index] = { ...manifest.releases[index], ...release };
else manifest.releases.unshift(release);

manifest.releases.sort((a, b) =>
  String(b.versionName).localeCompare(String(a.versionName), undefined, { numeric: true }),
);

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Published ${version} (code ${versionCode})${published ? "" : " [unpublished]"}`);
console.log(`  file:   public/downloads/${fileName}`);
console.log(`  size:   ${info.size.toLocaleString()} bytes`);
console.log(`  sha256: ${digest}`);
console.log(`  served: /downloads/${fileName}`);
console.log("");
console.log("Next: commit and push. Vercel redeploys and the download button serves this file.");

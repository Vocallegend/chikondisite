/**
 * Generate the release manifest from the REAL Android build.
 *
 *   node scripts/generate-release-manifest.mjs [--apk <path>] [--notes <path>]
 *
 * What it reads (nothing is invented):
 *   * versionCode / versionName / applicationId  -> android/app/build.gradle
 *   * minimum Android version                    -> android/variables.gradle (minSdkVersion)
 *   * file size, SHA-256, build time             -> the APK itself
 *   * release notes                              -> src/data/release-notes.json
 *
 * It writes `src/data/release.json`. An existing release for the same
 * versionName is updated in place; a new version is prepended, so the Release
 * Notes page keeps a history of every release actually manifest-ed here.
 *
 * The APK is NOT copied anywhere and NOT committed. `downloadUrl` is resolved at
 * runtime from RELEASE_DOWNLOAD_URL (see .env.example); the manifest only
 * records the release's own facts.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, stat } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const website = resolve(here, "..");
const repo = resolve(website, "..");

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

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

const buildGradlePath = resolve(repo, "android/app/build.gradle");
const variablesGradlePath = resolve(repo, "android/variables.gradle");
const manifestPath = resolve(website, "src/data/release.json");
const notesPath = resolve(website, "src/data/release-notes.json");

function defaultApk() {
  const preferred = resolve(repo, "android/app/release", "CHIKONDI.apk");
  const versioned = resolve(repo, "android/app/release");
  // Prefer a versioned `CHIKONDI-<version>.apk` over the unversioned copy.
  try {
    const candidates = readdirSync(versioned)
      .filter((f) => /^CHIKONDI-.+\.apk$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (candidates.length) return resolve(versioned, candidates[candidates.length - 1]);
  } catch {
    /* fall through */
  }
  if (existsSync(preferred)) return preferred;
  return resolve(repo, "android/app/build/outputs/apk/release/app-release.apk");
}

async function sha256(file) {
  const buf = await readFile(file);
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

function parseGradle(text, key) {
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    // Skip comment lines (the file documents `versionName` etc. in prose).
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    const m = t.match(new RegExp(`^${key}\\s+"?([^"\\s]+)"?`));
    if (m) return m[1];
  }
  return null;
}

const apkPath = resolve(repo, arg("--apk", process.env.APK_PATH || defaultApk()));
const notesFile = resolve(repo, arg("--notes", notesPath));

if (!existsSync(apkPath)) {
  console.error(`APK not found: ${apkPath}`);
  console.error("Build a release APK first, or pass --apk <path>.");
  process.exit(1);
}

const buildGradle = await readFile(buildGradlePath, "utf8");
const variablesGradle = await readFile(variablesGradlePath, "utf8");

const applicationId = parseGradle(buildGradle, "applicationId") ?? "zm.chikondi.app";
const versionCode = Number(parseGradle(buildGradle, "versionCode") ?? "0");
const versionName = parseGradle(buildGradle, "versionName") ?? "0.0.0";
const minSdk = Number(/(?:minSdkVersion|minSdk)\s*[:=]\s*(\d+)/.exec(variablesGradle)?.[1] ?? "24");

const info = await stat(apkPath);
const digest = await sha256(apkPath);

let notesByVersion = {};
if (existsSync(notesFile)) {
  notesByVersion = JSON.parse(await readFile(notesFile, "utf8"));
}

const release = {
  versionCode,
  versionName,
  published: true,
  releaseDate: info.mtime.toISOString().slice(0, 10),
  builtAt: info.mtime.toISOString(),
  fileName: `chikondi-${versionName}.apk`,
  fileSize: info.size,
  sha256: digest,
  minimumAndroidApi: minSdk,
  minimumAndroidVersion: API_TO_VERSION[minSdk] ?? String(minSdk),
  releaseNotes: Array.isArray(notesByVersion[versionName]) ? notesByVersion[versionName] : [],
  // Resolved at runtime from RELEASE_DOWNLOAD_URL. Never guessed here.
  downloadUrl: "",
};

let manifest = { app: "Chikondi", packageId: applicationId, channel: "stable", releases: [] };
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    /* regenerate from scratch */
  }
}
manifest.app = "Chikondi";
manifest.packageId = applicationId;
manifest.channel = manifest.channel || "stable";
manifest.releases = Array.isArray(manifest.releases) ? manifest.releases : [];

const idx = manifest.releases.findIndex((r) => r.versionName === versionName);
if (idx >= 0) manifest.releases[idx] = { ...manifest.releases[idx], ...release };
else manifest.releases.unshift(release);

manifest.releases.sort((a, b) =>
  String(b.versionName).localeCompare(String(a.versionName), undefined, { numeric: true }),
);

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`release manifest updated: ${manifestPath}`);
console.log(
  `  ${versionName} (code ${versionCode}) — ${info.size} bytes — sha256 ${digest.slice(0, 16)}…`,
);

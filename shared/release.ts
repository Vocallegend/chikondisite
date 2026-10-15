/**
 * Release manifest — shared by the website UI and the serverless functions.
 *
 * This module is deliberately dependency-free and side-effect-free: it is the
 * one place that decides what a release record means, so the Download page, the
 * /api/releases/latest endpoint and the /downloads/chikondi.apk redirect can
 * never disagree about the same release.
 *
 * Everything it validates is REAL data produced by
 * `scripts/generate-release-manifest.mjs` from the built APK. Nothing here
 * invents a version, a size, a checksum or a date.
 */

/** One release, exactly as stored in src/data/release.json. */
export type ReleaseEntry = {
  versionCode: number;
  versionName: string;
  published: boolean;
  /** ISO date (YYYY-MM-DD) the artifact was produced/published. */
  releaseDate: string;
  /** ISO timestamp the artifact was built. */
  builtAt?: string;
  /** Suggested file name for the download. */
  fileName: string;
  /** Exact byte size of the APK. */
  fileSize: number;
  /** Uppercase hex SHA-256 of the APK. */
  sha256: string;
  minimumAndroidApi: number;
  minimumAndroidVersion: string;
  releaseNotes: string[];
  /**
   * Official download location for this exact artifact. May be empty, in which
   * case RELEASE_DOWNLOAD_URL supplies it at runtime. Never guessed.
   */
  downloadUrl: string;
};

export type ReleaseManifest = {
  app: string;
  packageId: string;
  channel: string;
  releases: ReleaseEntry[];
};

const VERSION_RE = /^\d+(\.\d+){0,3}$/;
const SHA256_RE = /^[0-9A-Fa-f]{64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Semantic-ish comparison of dotted numeric versions: -1 | 0 | 1. */
export function compareVersions(a: string, b: string): number {
  const sa = String(a).split(".");
  const sb = String(b).split(".");
  const n = Math.max(sa.length, sb.length);
  for (let i = 0; i < n; i += 1) {
    const x = /^\d+$/.test(sa[i] ?? "") ? Number(sa[i]) : 0;
    const y = /^\d+$/.test(sb[i] ?? "") ? Number(sb[i]) : 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

export function isHttpsUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\/[^\s<>"]+$/.test(value) && value.length <= 2048;
}

/**
 * A path served by this website itself, e.g. `/downloads/chikondi-1.0.1.apk`.
 * Used when the APK is hosted here (uploaded to public/downloads) rather than
 * on external storage. Rejects protocol-relative (`//host`) and absolute URLs.
 */
export function isSitePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\s:<>"]/.test(value) &&
    value.length <= 300
  );
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  return raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null;
}

function str(raw: unknown, fallback = ""): string {
  return typeof raw === "string" ? raw : fallback;
}

function num(raw: unknown, fallback = 0): number {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}

function bool(raw: unknown, fallback = false): boolean {
  return typeof raw === "boolean" ? raw : fallback;
}

/** Validate one entry. Returns null when the record is not trustworthy. */
export function validateRelease(raw: unknown): ReleaseEntry | null {
  const r = asRecord(raw);
  if (!r) return null;

  const versionName = str(r.versionName);
  if (!VERSION_RE.test(versionName)) return null;

  const sha256 = str(r.sha256);
  if (!SHA256_RE.test(sha256)) return null;

  const fileSize = num(r.fileSize, -1);
  if (fileSize < 0) return null;

  const releaseDate = str(r.releaseDate);
  if (!DATE_RE.test(releaseDate) || !Number.isFinite(Date.parse(releaseDate))) return null;

  const notes = Array.isArray(r.releaseNotes)
    ? r.releaseNotes.filter((n): n is string => typeof n === "string" && n.trim().length > 0)
    : [];

  return {
    versionCode: Math.max(0, Math.trunc(num(r.versionCode, 0))),
    versionName,
    published: bool(r.published, false),
    releaseDate,
    ...(typeof r.builtAt === "string" ? { builtAt: r.builtAt } : {}),
    fileName: str(r.fileName) || `chikondi-${versionName}.apk`,
    fileSize: Math.trunc(fileSize),
    sha256: sha256.toUpperCase(),
    minimumAndroidApi: Math.max(0, Math.trunc(num(r.minimumAndroidApi, 0))),
    minimumAndroidVersion: str(r.minimumAndroidVersion) || "Not available",
    releaseNotes: notes,
    downloadUrl: isHttpsUrl(r.downloadUrl) || isSitePath(r.downloadUrl) ? r.downloadUrl : "",
  };
}

/**
 * Validate a whole manifest. Invalid release rows are dropped rather than
 * trusted; if the envelope itself is not an object this returns null, and every
 * caller treats null as "no release metadata" (an honest unavailable state).
 */
export function parseReleaseManifest(raw: unknown): ReleaseManifest | null {
  const r = asRecord(raw);
  if (!r) return null;
  if (!Array.isArray(r.releases)) return null;
  const releases = r.releases
    .map(validateRelease)
    .filter((entry): entry is ReleaseEntry => entry !== null);
  return {
    app: str(r.app, "Chikondi") || "Chikondi",
    packageId: str(r.packageId),
    channel: str(r.channel, "stable") || "stable",
    releases,
  };
}

/** The newest published release, or null when none is marked published. */
export function latestPublished(manifest: ReleaseManifest | null): ReleaseEntry | null {
  if (!manifest) return null;
  const published = manifest.releases.filter((r) => r.published);
  if (published.length === 0) return null;
  return published.reduce((best, r) =>
    compareVersions(r.versionName, best.versionName) > 0 ? r : best,
  );
}

/** Newest published first, for the Release Notes page. */
export function publishedReleases(manifest: ReleaseManifest | null): ReleaseEntry[] {
  if (!manifest) return [];
  return manifest.releases
    .filter((r) => r.published)
    .slice()
    .sort((a, b) => compareVersions(b.versionName, a.versionName));
}

/**
 * Where this release is actually downloaded from.
 *
 * Order: an explicit HTTPS override, then the release's own recorded URL. The
 * recorded URL may be an absolute HTTPS URL (external storage) or a path served
 * by this site (e.g. `/downloads/chikondi-1.0.1.apk` when the APK is hosted in
 * public/downloads). Returns null when nothing usable is configured — the UI
 * must show "download unavailable", never a dead or guessed link.
 */
export function resolveDownloadUrl(
  entry: ReleaseEntry | null,
  override?: string | null,
): string | null {
  if (!entry) return null;
  if (isHttpsUrl(override)) return override;
  if (isHttpsUrl(entry.downloadUrl)) return entry.downloadUrl;
  if (isSitePath(entry.downloadUrl)) return entry.downloadUrl;
  return null;
}

/** Human file size from real bytes. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Not available";
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** ISO date (YYYY-MM-DD) to a readable date. Deterministic, locale-independent. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "Not available";
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return "Not available";
  return `${Number(m[3])} ${MONTHS[month]} ${m[1]}`;
}

/**
 * Format a SHA-256 as colon-separated byte pairs (the form Windows `certutil`
 * and `sha256sum` users can compare by eye). Grouped, never truncated.
 */
export function formatChecksum(hex: string): string {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  return clean.match(/.{2}/g)?.join(":") ?? clean;
}

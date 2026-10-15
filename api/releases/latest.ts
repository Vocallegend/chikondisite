/**
 * GET /api/releases/latest
 *
 * Read-only, validated metadata for the latest PUBLISHED release. This is the
 * machine-readable half of the Download page: the page renders the same record
 * the endpoint returns, so nothing can drift.
 *
 * It exposes only facts about the release (version, size, checksum, date,
 * compatibility) and one download URL. It never exposes signing material,
 * storage credentials, internal file paths or unpublished builds.
 */
import releaseManifest from "../../src/data/release.json" with { type: "json" };
import {
  latestPublished,
  parseReleaseManifest,
  resolveDownloadUrl,
  type ReleaseEntry,
} from "../../shared/release.js";
import type { ApiRequest, ApiResponse } from "../../server/http.js";
import { methodNotAllowed } from "../../server/http.js";

const manifest = parseReleaseManifest(releaseManifest);

function payload(entry: ReleaseEntry) {
  const downloadUrl = resolveDownloadUrl(entry, process.env.RELEASE_DOWNLOAD_URL);
  return {
    app: manifest?.app ?? "Chikondi",
    packageId: manifest?.packageId ?? "",
    channel: manifest?.channel ?? "stable",
    versionCode: entry.versionCode,
    versionName: entry.versionName,
    published: entry.published,
    releaseDate: entry.releaseDate,
    // null when no official location is configured — never a guessed link.
    downloadUrl,
    downloadAvailable: downloadUrl !== null,
    // Same-origin, version-independent link. Always an https URL in production.
    stableDownloadUrl: process.env.RELEASE_STABLE_URL || "/downloads/chikondi.apk",
    sha256: entry.sha256,
    fileSize: entry.fileSize,
    minimumAndroidVersion: entry.minimumAndroidVersion,
    minimumAndroidApi: entry.minimumAndroidApi,
    releaseNotes: entry.releaseNotes,
  };
}

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    methodNotAllowed(res, ["GET", "HEAD"]);
    return;
  }

  if (!manifest) {
    res.status(500).json({
      error: "release_manifest_invalid",
      message: "The release manifest could not be validated. Publish a valid manifest before serving releases.",
    });
    return;
  }

  const latest = latestPublished(manifest);
  if (!latest) {
    res.status(404).json({
      error: "no_published_release",
      message: "No release is currently marked as published.",
    });
    return;
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json(payload(latest));
}

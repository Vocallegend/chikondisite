/**
 * Stable download endpoint.
 *
 *   GET /downloads/chikondi.apk          -> 302 to the latest published APK
 *   GET /downloads/chikondi-latest.apk   -> same
 *
 * The URL never changes; what it points at changes when a new release is
 * published. It redirects rather than streaming the file, so the APK is served
 * by the object host (GitHub Releases, object storage) and this function stays
 * tiny and cheap.
 *
 * When no official download location is configured it returns a real 503 with
 * setup instructions. It never silently falls back to an unrelated or older
 * APK, and it never serves a 404-looking HTML page in place of the file.
 */
import releaseManifest from "../src/data/release.json" with { type: "json" };
import { latestPublished, parseReleaseManifest, resolveDownloadUrl } from "../shared/release.js";
import type { ApiRequest, ApiResponse } from "../server/http.js";
import { methodNotAllowed } from "../server/http.js";

const manifest = parseReleaseManifest(releaseManifest);

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    methodNotAllowed(res, ["GET", "HEAD"]);
    return;
  }

  res.setHeader("Cache-Control", "no-store");

  const latest = manifest ? latestPublished(manifest) : null;
  const target = resolveDownloadUrl(latest, process.env.RELEASE_DOWNLOAD_URL);

  if (!target) {
    res.status(503).json({
      error: "download_unavailable",
      message:
        "The official download location is not configured yet. Set RELEASE_DOWNLOAD_URL " +
        "(or the downloadUrl on the latest release in src/data/release.json) to the " +
        "published APK, then redeploy.",
      version: latest?.versionName ?? null,
    });
    return;
  }

  // 302 (not 301): the target moves when a new version is published.
  res.setHeader("X-Chikondi-Version", latest?.versionName ?? "unknown");
  res.redirect(302, target);
}

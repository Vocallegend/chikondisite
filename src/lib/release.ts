/**
 * Release data for the website.
 *
 * The build-time manifest (src/data/release.json, generated from the real APK by
 * scripts/generate-release-manifest.mjs) is the source of truth and is available
 * immediately. On the Download page we also ask /api/releases/latest for the
 * live record, because only the server knows whether an official download
 * location has been configured; the bundled copy cannot know that.
 *
 * When the live call fails the build-time record is kept and clearly labelled as
 * such — the page never presents stale data as live.
 */
import { useEffect, useState } from "react";
import {
  formatBytes,
  formatChecksum,
  formatDate,
  latestPublished,
  parseReleaseManifest,
  publishedReleases,
  type ReleaseEntry,
} from "@shared/release";
import rawManifest from "@/data/release.json";

export const manifest = parseReleaseManifest(rawManifest);
export const bundledLatest: ReleaseEntry | null = latestPublished(manifest);
export const bundledReleases: ReleaseEntry[] = publishedReleases(manifest);

export { formatBytes, formatChecksum, formatDate };

/** The stable, version-independent download link served by this site. */
export const STABLE_DOWNLOAD_PATH = "/downloads/chikondi.apk";

type LivePayload = {
  versionCode: number;
  versionName: string;
  releaseDate: string;
  fileSize: number;
  sha256: string;
  minimumAndroidVersion: string;
  releaseNotes: string[];
  downloadAvailable: boolean;
  stableDownloadUrl: string;
};

function isLivePayload(value: unknown): value is LivePayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.versionName === "string" &&
    typeof v.sha256 === "string" &&
    typeof v.fileSize === "number" &&
    typeof v.downloadAvailable === "boolean"
  );
}

export type LatestReleaseState = {
  release: ReleaseEntry | null;
  /** true when the values came from /api/releases/latest. */
  live: boolean;
  /** null until the server answers; false means "not configured yet". */
  downloadAvailable: boolean | null;
  stableDownloadPath: string;
};

const INITIAL: LatestReleaseState = {
  release: bundledLatest,
  live: false,
  downloadAvailable: null,
  stableDownloadPath: STABLE_DOWNLOAD_PATH,
};

/**
 * The latest release, refreshed from the server.
 *
 * Any failure (cold function, offline, non-200) leaves the build-time record in
 * place. The record is never fabricated and `live` is never set on a guess.
 */
export function useLatestRelease(): LatestReleaseState {
  const [state, setState] = useState<LatestReleaseState>(INITIAL);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/releases/latest", {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (cancelled || !isLivePayload(data)) return;
        setState({
          release: {
            versionCode: data.versionCode,
            versionName: data.versionName,
            published: true,
            releaseDate: data.releaseDate,
            fileName: `chikondi-${data.versionName}.apk`,
            fileSize: data.fileSize,
            sha256: data.sha256,
            minimumAndroidApi: 0,
            minimumAndroidVersion: data.minimumAndroidVersion,
            releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : [],
            downloadUrl: "",
          },
          live: true,
          downloadAvailable: data.downloadAvailable,
          stableDownloadPath: data.stableDownloadUrl || STABLE_DOWNLOAD_PATH,
        });
      } catch {
        /* keep the build-time record */
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return state;
}

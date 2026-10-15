import { describe, expect, it } from "vitest";
import {
  compareVersions,
  formatBytes,
  formatChecksum,
  formatDate,
  isHttpsUrl,
  latestPublished,
  parseReleaseManifest,
  publishedReleases,
  resolveDownloadUrl,
  validateRelease,
  type ReleaseEntry,
} from "@shared/release";

const VALID: ReleaseEntry = {
  versionCode: 2,
  versionName: "1.0.1",
  published: true,
  releaseDate: "2026-10-15",
  fileName: "chikondi-1.0.1.apk",
  fileSize: 7_875_412,
  sha256: "9f73aac2f5dc36511070c4ccfcc2a159b146b8c9c8d2e800727e487b21f930b8",
  minimumAndroidApi: 24,
  minimumAndroidVersion: "7.0",
  releaseNotes: ["Something changed"],
  downloadUrl: "",
};

describe("compareVersions", () => {
  it("orders dotted numeric versions", () => {
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.2", "1.10")).toBe(-1);
    expect(compareVersions("2.0", "2.0.0")).toBe(0);
    expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
  });
});

describe("validateRelease", () => {
  it("accepts a complete record and normalises the checksum", () => {
    const result = validateRelease({ ...VALID, sha256: VALID.sha256.toLowerCase() });
    expect(result).not.toBeNull();
    expect(result?.sha256).toBe(VALID.sha256.toUpperCase());
    expect(result?.fileSize).toBe(VALID.fileSize);
  });

  it("rejects a malformed version name", () => {
    expect(validateRelease({ ...VALID, versionName: "latest" })).toBeNull();
  });

  it("rejects a checksum that is not 64 hex characters", () => {
    expect(validateRelease({ ...VALID, sha256: "abc123" })).toBeNull();
  });

  it("rejects an impossible release date", () => {
    expect(validateRelease({ ...VALID, releaseDate: "yesterday" })).toBeNull();
  });

  it("rejects a non-numeric size", () => {
    expect(validateRelease({ ...VALID, fileSize: "8 MB" })).toBeNull();
  });

  it("rejects a non-object", () => {
    expect(validateRelease(null)).toBeNull();
    expect(validateRelease("1.0.1")).toBeNull();
  });

  it("never trusts an http (non-https) download URL", () => {
    const result = validateRelease({ ...VALID, downloadUrl: "http://example.com/app.apk" });
    expect(result?.downloadUrl).toBe("");
  });
});

describe("parseReleaseManifest", () => {
  it("drops invalid rows instead of trusting them", () => {
    const manifest = parseReleaseManifest({
      app: "Chikondi",
      packageId: "zm.chikondi.app",
      channel: "stable",
      releases: [VALID, { versionName: 42 }],
    });
    expect(manifest?.releases).toHaveLength(1);
  });

  it("returns null when the envelope is unusable", () => {
    expect(parseReleaseManifest(null)).toBeNull();
    expect(parseReleaseManifest({ releases: "none" })).toBeNull();
    expect(parseReleaseManifest({ app: "Chikondi" })).toBeNull();
  });
});

describe("latestPublished / publishedReleases", () => {
  const manifest = parseReleaseManifest({
    app: "Chikondi",
    packageId: "zm.chikondi.app",
    channel: "stable",
    releases: [
      { ...VALID, versionName: "1.0.0", versionCode: 1 },
      { ...VALID, versionName: "1.2.0", versionCode: 3 },
      { ...VALID, versionName: "1.1.0", versionCode: 2, published: false },
    ],
  });

  it("returns the newest published release", () => {
    expect(latestPublished(manifest)?.versionName).toBe("1.2.0");
  });

  it("lists published releases newest first", () => {
    expect(publishedReleases(manifest).map((r) => r.versionName)).toEqual(["1.2.0", "1.0.0"]);
  });

  it("returns null when nothing is published", () => {
    const unpublished = parseReleaseManifest({
      app: "Chikondi",
      packageId: "zm.chikondi.app",
      channel: "stable",
      releases: [{ ...VALID, published: false }],
    });
    expect(latestPublished(unpublished)).toBeNull();
  });

  it("returns null for a null manifest", () => {
    expect(latestPublished(null)).toBeNull();
    expect(publishedReleases(null)).toEqual([]);
  });
});

describe("resolveDownloadUrl", () => {
  const entry = validateRelease({ ...VALID, downloadUrl: "https://example.com/real.apk" });

  it("prefers an https override", () => {
    expect(resolveDownloadUrl(entry, "https://cdn.example.com/latest.apk")).toBe(
      "https://cdn.example.com/latest.apk",
    );
  });

  it("falls back to the release record", () => {
    expect(resolveDownloadUrl(entry, null)).toBe("https://example.com/real.apk");
  });

  it("ignores a non-https override and returns the record", () => {
    expect(resolveDownloadUrl(entry, "http://cdn.example.com/latest.apk")).toBe(
      "https://example.com/real.apk",
    );
  });

  it("returns null when neither is usable", () => {
    const blank = validateRelease(VALID);
    expect(resolveDownloadUrl(blank, "javascript:alert(1)")).toBeNull();
    expect(resolveDownloadUrl(null)).toBeNull();
  });
});

describe("isHttpsUrl", () => {
  it("accepts https and rejects everything else", () => {
    expect(isHttpsUrl("https://example.com/a.apk")).toBe(true);
    expect(isHttpsUrl("http://example.com/a.apk")).toBe(false);
    expect(isHttpsUrl("/downloads/chikondi.apk")).toBe(false);
    expect(isHttpsUrl(undefined)).toBe(false);
    expect(isHttpsUrl("https://exa mple.com")).toBe(false);
  });
});

describe("formatting", () => {
  it("formats bytes with honest units", () => {
    expect(formatBytes(0)).toBe("0 bytes");
    expect(formatBytes(512)).toBe("512 bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(7_875_412)).toBe("7.5 MB");
    expect(formatBytes(-1)).toBe("Not available");
  });

  it("formats ISO dates deterministically", () => {
    expect(formatDate("2026-10-15")).toBe("15 October 2026");
    expect(formatDate("2026-10-15T10:49:38.654Z")).toBe("15 October 2026");
    expect(formatDate("nonsense")).toBe("Not available");
  });

  it("groups a checksum into byte pairs", () => {
    expect(formatChecksum("9f73")).toBe("9F:73");
  });
});

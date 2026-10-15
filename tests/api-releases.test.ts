import { afterEach, beforeEach, describe, expect, it } from "vitest";
import handler from "../api/releases/latest";
import type { ApiRequest, ApiResponse } from "../server/http";
import releaseJson from "../src/data/release.json";

type Recorder = {
  res: ApiResponse;
  status: number;
  body: unknown;
  headers: Record<string, string | number | string[]>;
};

function recorder(): Recorder {
  const state: Recorder = {
    status: 0,
    body: undefined,
    headers: {},
    res: undefined as unknown as ApiResponse,
  };
  const res: ApiResponse = {
    status(code) {
      state.status = code;
      return res;
    },
    json(body) {
      state.body = body;
    },
    send(body) {
      state.body = body;
    },
    setHeader(name, value) {
      state.headers[name] = value;
    },
    end() {
      /* no-op */
    },
    redirect() {
      /* no-op */
    },
  };
  state.res = res;
  return state;
}

const PUBLISHED = releaseJson.releases.find((release) => release.published)!;

beforeEach(() => {
  delete process.env.RELEASE_DOWNLOAD_URL;
  delete process.env.RELEASE_STABLE_URL;
});

afterEach(() => {
  delete process.env.RELEASE_DOWNLOAD_URL;
  delete process.env.RELEASE_STABLE_URL;
});

describe("GET /api/releases/latest", () => {
  it("returns the real published release with honest availability", () => {
    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);

    expect(rec.status).toBe(200);
    const body = rec.body as Record<string, unknown>;
    expect(body.versionName).toBe(PUBLISHED.versionName);
    expect(body.versionCode).toBe(PUBLISHED.versionCode);
    expect(body.fileSize).toBe(PUBLISHED.fileSize);
    expect(body.sha256).toBe(PUBLISHED.sha256);
    expect(body.published).toBe(true);
    // No RELEASE_DOWNLOAD_URL and no manifest downloadUrl -> not available, never guessed.
    expect(body.downloadAvailable).toBe(false);
    expect(body.downloadUrl).toBeNull();
    expect(body.stableDownloadUrl).toBe("/downloads/chikondi.apk");
  });

  it("reports the configured download location when one is set", () => {
    process.env.RELEASE_DOWNLOAD_URL = "https://example.com/chikondi-1.0.1.apk";
    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);

    const body = rec.body as Record<string, unknown>;
    expect(body.downloadAvailable).toBe(true);
    expect(body.downloadUrl).toBe("https://example.com/chikondi-1.0.1.apk");
  });

  it("never exposes signing material or credentials", () => {
    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);
    const serialised = JSON.stringify(rec.body).toLowerCase();
    for (const forbidden of ["password", "keystore", "secret", "token", "private"]) {
      expect(serialised).not.toContain(forbidden);
    }
  });
});

describe("method handling", () => {
  it("allows GET and HEAD, and rejects everything else with 405", () => {
    const head = recorder();
    handler({ method: "HEAD", headers: {} } as ApiRequest, head.res);
    expect(head.status).toBe(200);

    const post = recorder();
    handler({ method: "POST", headers: {} } as ApiRequest, post.res);
    expect(post.status).toBe(405);
    expect(post.headers.Allow).toBe("GET, HEAD");
  });
});

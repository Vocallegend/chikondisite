import { afterEach, beforeEach, describe, expect, it } from "vitest";
import handler from "../api/download";
import type { ApiRequest, ApiResponse } from "../server/http";
import releaseJson from "../src/data/release.json";

type Recorder = {
  res: ApiResponse;
  status: number;
  body: unknown;
  headers: Record<string, string | number | string[]>;
  redirect: { status: number; url: string } | null;
};

function recorder(): Recorder {
  const state: Recorder = {
    status: 0,
    body: undefined,
    headers: {},
    redirect: null,
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
    redirect(status, url) {
      state.redirect = { status, url };
      state.status = status;
    },
  };
  state.res = res;
  return state;
}

const PUBLISHED = releaseJson.releases.find((release) => release.published)!;

beforeEach(() => {
  delete process.env.RELEASE_DOWNLOAD_URL;
});

afterEach(() => {
  delete process.env.RELEASE_DOWNLOAD_URL;
});

describe("GET /downloads/chikondi.apk", () => {
  it("redirects (302, not 301) to the APK this site hosts", () => {
    // A published release must point somewhere real: a same-origin
    // /downloads/... path (APK uploaded to this site) or an https URL.
    expect(PUBLISHED.downloadUrl).not.toBe("");
    expect(PUBLISHED.downloadUrl.startsWith("/downloads/")).toBe(true);

    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);

    expect(rec.redirect).toEqual({ status: 302, url: PUBLISHED.downloadUrl });
    expect(rec.headers["X-Chikondi-Version"]).toBe(PUBLISHED.versionName);
    expect(rec.headers["Cache-Control"]).toBe("no-store");
  });

  it("answers HEAD the same way as GET (no body, same redirect)", () => {
    const rec = recorder();
    handler({ method: "HEAD", headers: {} } as ApiRequest, rec.res);

    expect(rec.redirect?.status).toBe(302);
    expect(rec.redirect?.url).toBe(PUBLISHED.downloadUrl);
  });

  it("prefers an https override over the hosted APK", () => {
    process.env.RELEASE_DOWNLOAD_URL = "https://cdn.example.com/chikondi-1.0.1.apk";
    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);

    expect(rec.redirect).toEqual({
      status: 302,
      url: "https://cdn.example.com/chikondi-1.0.1.apk",
    });
  });

  it("never redirects to a non-https override", () => {
    process.env.RELEASE_DOWNLOAD_URL = "http://insecure.example.com/app.apk";
    const rec = recorder();
    handler({ method: "GET", headers: {} } as ApiRequest, rec.res);

    expect(rec.redirect?.url).not.toContain("insecure.example.com");
    expect(rec.redirect?.url.startsWith("/downloads/")).toBe(true);
  });
});

describe("method handling", () => {
  it("rejects anything other than GET/HEAD with 405", () => {
    const rec = recorder();
    handler({ method: "POST", headers: {} } as ApiRequest, rec.res);

    expect(rec.status).toBe(405);
    expect(rec.headers.Allow).toBe("GET, HEAD");
    expect(rec.redirect).toBeNull();
  });
});

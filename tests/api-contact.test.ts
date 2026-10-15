import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/contact";
import type { ApiRequest, ApiResponse } from "../server/http";

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

/** A unique client IP per request keeps the module-global memory limiter isolated. */
let ipCounter = 0;
function request(method: string, body?: unknown, ip?: string): ApiRequest {
  ipCounter += 1;
  return {
    method,
    headers: { "x-forwarded-for": ip ?? `203.0.113.${ipCounter % 250}` },
    body,
  };
}

/** A complete, human-plausible submission. `startedAt` is comfortably older
 *  than the 1500ms anti-bot threshold and well inside the one-week staleness
 *  cutoff, so it passes every non-rate-limit check by default. */
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "Grace Phiri",
    email: "grace@example.com",
    subject: "Cannot install the app",
    category: "Installation problem",
    message: "The installer says the package is invalid on my Android 8 phone.",
    startedAt: Date.now() - 60_000,
    ...overrides,
  };
}

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.CONTACT_FALLBACK_EMAIL;
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.CONTACT_FALLBACK_EMAIL;
  vi.unstubAllGlobals();
});

describe("GET /api/contact", () => {
  it("reports 'not configured' and hides a fallback nobody set", async () => {
    const rec = recorder();
    await handler(request("GET"), rec.res);

    expect(rec.status).toBe(200);
    expect(rec.body).toEqual({ configured: false, fallbackEmail: null });
  });

  it("reports the operator-chosen fallback address when one exists", async () => {
    process.env.CONTACT_FALLBACK_EMAIL = "hello@example.com";
    const rec = recorder();
    await handler(request("GET"), rec.res);

    expect(rec.body).toEqual({ configured: false, fallbackEmail: "hello@example.com" });
  });
});

describe("POST /api/contact", () => {
  it("rejects an invalid submission with per-field errors", async () => {
    const rec = recorder();
    await handler(request("POST", validBody({ message: "too short" })), rec.res);

    expect(rec.status).toBe(400);
    const body = rec.body as Record<string, unknown>;
    expect(body.error).toBe("validation_failed");
    expect((body.fields as Record<string, string>).message).toBeTruthy();
  });

  it("drops a submission that filled the honeypot", async () => {
    const rec = recorder();
    await handler(request("POST", validBody({ company: "spam bot" })), rec.res);

    expect(rec.status).toBe(400);
    expect((rec.body as Record<string, unknown>).error).toBe("rejected");
  });

  it("drops a submission returned faster than a human could read it", async () => {
    const rec = recorder();
    await handler(request("POST", validBody({ startedAt: Date.now() })), rec.res);

    expect(rec.status).toBe(400);
    expect((rec.body as Record<string, unknown>).error).toBe("rejected");
  });

  it("returns an honest 503 when the email provider is not configured", async () => {
    const rec = recorder();
    await handler(request("POST", validBody()), rec.res);

    expect(rec.status).toBe(503);
    const body = rec.body as Record<string, unknown>;
    expect(body.error).toBe("contact_not_configured");
    expect(String(body.message)).toContain("RESEND_API_KEY");
  });

  it("delivers through Resend and returns ok when fully configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "inbox@example.com";
    process.env.CONTACT_FROM_EMAIL = "site@example.com";

    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const rec = recorder();
    await handler(request("POST", validBody()), rec.res);

    expect(rec.status).toBe(200);
    expect(rec.body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe("https://api.resend.com/emails");
    const auth = (call[1].headers as Record<string, string>).Authorization;
    expect(auth).toBe("Bearer re_test_key");
  });

  it("reports a delivery failure rather than a fake success", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "inbox@example.com";
    process.env.CONTACT_FROM_EMAIL = "site@example.com";

    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 422 })));

    const rec = recorder();
    await handler(request("POST", validBody()), rec.res);

    expect(rec.status).toBe(502);
    expect((rec.body as Record<string, unknown>).error).toBe("delivery_failed");
  });

  it("rate-limits a burst from one connection with Retry-After", async () => {
    const ip = "198.51.100.7";
    let last: Recorder | null = null;
    for (let i = 0; i < 6; i += 1) {
      last = recorder();
      await handler(request("POST", validBody(), ip), last.res);
    }

    expect(last!.status).toBe(429);
    expect((last!.body as Record<string, unknown>).error).toBe("rate_limited");
    expect(last!.headers["Retry-After"]).toBeTruthy();
  });
});

describe("method handling", () => {
  it("rejects unsupported methods with 405", async () => {
    const rec = recorder();
    await handler(request("DELETE"), rec.res);

    expect(rec.status).toBe(405);
    expect(rec.headers.Allow).toBe("GET, POST");
  });
});

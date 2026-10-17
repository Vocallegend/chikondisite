import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, RequestTimeoutError } from "@/lib/http";

type FetchStub = ReturnType<typeof vi.fn>;

function stubFetch(
  implementation: (url: string, init: RequestInit) => Promise<Response>,
): FetchStub {
  const spy = vi.fn(implementation);
  vi.stubGlobal("fetch", spy);
  return spy;
}

function response(): Response {
  return new Response("{}", { status: 200 });
}

/**
 * A stand-in for a request the network never answers. It behaves like the real
 * fetch about cancellation: it rejects as soon as the signal aborts, and
 * immediately when the signal was already aborted.
 */
function neverAnswers(_url: string, init: RequestInit): Promise<Response> {
  return new Promise<Response>((_resolve, reject) => {
    const signal = init.signal;
    if (!signal) return;
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchWithTimeout", () => {
  it("passes the request through unchanged when it answers in time", async () => {
    vi.useFakeTimers();
    const spy = stubFetch(async () => response());

    const pending = fetchWithTimeout("/api/releases/latest", {
      headers: { accept: "application/json" },
    });
    await vi.advanceTimersByTimeAsync(1);
    const result = await pending;

    expect(result.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      "/api/releases/latest",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
  });

  it("rejects with RequestTimeoutError instead of hanging forever", async () => {
    vi.useFakeTimers();
    // A server that never answers: exactly the case that used to leave the
    // caller waiting with no way out.
    stubFetch(neverAnswers);

    const pending = fetchWithTimeout("/api/releases/latest", {}, 5_000);
    const assertion = expect(pending).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(5_001);
    await assertion;
  });

  it("aborts the underlying request when the caller's signal aborts", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const spy = stubFetch(neverAnswers);

    const pending = fetchWithTimeout("/api/contact", { signal: controller.signal }, 5_000);
    const rejection = expect(pending).rejects.toThrow();
    controller.abort();
    await rejection;

    // Caller-initiated cancellation is not a timeout: no timer is left behind.
    await vi.advanceTimersByTimeAsync(10_000);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("fails immediately when the caller's signal is already aborted", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    controller.abort();
    const spy = stubFetch(neverAnswers);

    const pending = fetchWithTimeout("/api/contact", { signal: controller.signal }, 5_000);
    await expect(pending).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

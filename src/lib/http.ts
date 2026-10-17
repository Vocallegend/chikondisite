/**
 * fetch with a bounded timeout.
 *
 * A request that never settles is worse than one that fails: it leaves the
 * caller waiting forever, and on a flaky mobile connection that is exactly
 * what happens. This wraps fetch so every request the site makes gives up
 * after `timeoutMs` and rejects with RequestTimeoutError, which callers can
 * tell apart from a genuine network or HTTP failure.
 *
 * An AbortSignal passed in `init.signal` keeps its meaning — unmounting a
 * component still cancels its request — and the timeout timer is always
 * cleared, so a settled request never leaves a stray timer behind.
 */

export const DEFAULT_TIMEOUT_MS = 8_000;

export class RequestTimeoutError extends Error {
  readonly url: string;
  readonly timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms: ${url}`);
    this.name = "RequestTimeoutError";
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const external = init.signal ?? null;
  const relayAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", relayAbort, { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new RequestTimeoutError(input, timeoutMs);
    throw error;
  } finally {
    clearTimeout(timer);
    external?.removeEventListener("abort", relayAbort);
  }
}

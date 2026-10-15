/**
 * Rate limiting for the contact endpoint.
 *
 * Two backends, chosen by environment:
 *
 *   1. Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) —
 *      a real limit shared across every serverless instance. This is the only
 *      backend that holds under load, and it is what production should use.
 *   2. In-memory — a best-effort limit that lives for the lifetime of one
 *      serverless instance. Serverless instances come and go and are not
 *      shared, so this catches a burst against a single warm instance and
 *      nothing more.
 *
 * The endpoint reports which backend it used in its response so an operator can
 * see, from a real request, whether the strong limit is actually active.
 */

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  backend: "upstash" | "memory";
};

const memory = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;
  const hits = (memory.get(key) ?? []).filter((t) => t > cutoff);
  hits.push(now);
  memory.set(key, hits);
  // Stop the map growing without bound in a long-lived instance.
  if (memory.size > 5000) {
    for (const [k, v] of memory) {
      if (v.every((t) => t <= cutoff)) memory.delete(k);
    }
  }
  return {
    allowed: hits.length <= limit,
    limit,
    remaining: Math.max(0, limit - hits.length),
    backend: "memory",
  };
}

async function upstashLimit(
  url: string,
  token: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult | null> {
  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds), "NX"],
      ]),
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { result?: number }[];
    const count = Number(data?.[0]?.result ?? 0);
    if (!Number.isFinite(count) || count <= 0) return null;
    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      backend: "upstash",
    };
  } catch {
    // A rate-limit outage must not take the contact form down; fall through to
    // the in-memory limiter rather than rejecting a real message.
    return null;
  }
}

export async function checkRateLimit(options: {
  key: string;
  limit: number;
  windowSeconds: number;
  env?: NodeJS.ProcessEnv;
}): Promise<RateLimitResult> {
  const env = options.env ?? process.env;
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  const windowKey = `chikondi:contact:${options.key}:${Math.floor(Date.now() / (options.windowSeconds * 1000))}`;
  if (url && token) {
    const result = await upstashLimit(url, token, windowKey, options.limit, options.windowSeconds);
    if (result) return result;
  }
  return memoryLimit(windowKey, options.limit, options.windowSeconds);
}

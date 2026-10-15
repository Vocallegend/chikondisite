/**
 * Minimal request/response types and helpers for Vercel Node functions.
 *
 * These live outside `api/` on purpose: every file inside `api/` is a route, so
 * shared server code belongs beside it, not in it. Declared locally rather than
 * pulled from `@vercel/node` to keep the dependency tree small.
 */
export type ApiRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

export type ApiResponse = {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  send(body: unknown): void;
  setHeader(name: string, value: string | number | string[]): void;
  end(chunk?: string): void;
  redirect(status: number, url: string): void;
};

export function header(req: ApiRequest, name: string): string | undefined {
  const raw = req.headers[name.toLowerCase()] ?? req.headers[name];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export function clientIp(req: ApiRequest): string {
  const forwarded = header(req, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = header(req, "x-real-ip");
  if (real) return real.trim();
  return req.socket?.remoteAddress ?? "unknown";
}

/** Parse a body that may arrive as an object, JSON text or urlencoded text. */
export function readBody(req: ApiRequest): Record<string, unknown> {
  const body = req.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  if (typeof body === "string" && body.length > 0) {
    const type = header(req, "content-type") ?? "";
    if (type.includes("application/json")) {
      try {
        const parsed: unknown = JSON.parse(body);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return {};
      }
    }
    const params = new URLSearchParams(body);
    return Object.fromEntries(params.entries());
  }
  return {};
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]): void {
  res.setHeader("Allow", allowed.join(", "));
  res.status(405).json({ error: "method_not_allowed", allowed });
}

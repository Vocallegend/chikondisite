/**
 * Contact form endpoint.
 *
 *   GET  /api/contact -> whether any delivery path is configured (no secrets)
 *   POST /api/contact -> rate-limit, validate, then deliver to every configured
 *                        path: a row in Supabase (read by the admin console)
 *                        and an email through Resend.
 *
 * Everything is validated on the server with the same rules the browser uses
 * (`shared/contact.ts`). No configuration value is ever returned to the client
 * except the operator-chosen fallback address.
 *
 * Delivery succeeds when at least one configured path accepts the message. If
 * no path is configured the endpoint returns a clear 503; if every configured
 * path fails it returns 502. It never reports a fake success.
 */
import { spamSignal, validateContact } from "../shared/contact.js";
import {
  clientIp,
  header,
  methodNotAllowed,
  readBody,
  type ApiRequest,
  type ApiResponse,
} from "../server/http.js";
import { readContactConfig, sendContactEmail } from "../server/email.js";
import { readStoreConfig, storeContactMessage } from "../server/store.js";
import { checkRateLimit } from "../server/rate-limit.js";

const LIMIT = 5; // messages
const WINDOW_SECONDS = 10 * 60; // per ten minutes, per IP

function configStatus() {
  const email = readContactConfig();
  const store = readStoreConfig();
  return {
    configured: email.configured || store.configured,
    // Present only when the operator set it; otherwise the UI hides the
    // fallback rather than showing an address nobody owns.
    fallbackEmail: email.fallbackEmail || null,
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method === "GET") {
    res.status(200).json(configStatus());
    return;
  }
  if (req.method !== "POST") {
    methodNotAllowed(res, ["GET", "POST"]);
    return;
  }

  const rate = await checkRateLimit({
    key: clientIp(req),
    limit: LIMIT,
    windowSeconds: WINDOW_SECONDS,
  });
  if (!rate.allowed) {
    res.setHeader("Retry-After", String(WINDOW_SECONDS));
    res.status(429).json({
      error: "rate_limited",
      message: "Too many messages from this connection. Please try again later.",
    });
    return;
  }

  const body = readBody(req);

  const signal = spamSignal(body, Date.now());
  if (signal) {
    res.status(400).json({
      error: "rejected",
      message: "This submission looked automated and was not sent.",
    });
    return;
  }

  const validation = validateContact(body);
  if (!validation.ok) {
    res.status(400).json({ error: "validation_failed", fields: validation.errors });
    return;
  }

  const email = readContactConfig();
  const store = readStoreConfig();

  if (!email.configured && !store.configured) {
    res.status(503).json({
      error: "contact_not_configured",
      message:
        "The contact form is not connected yet. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "to deliver messages into the admin console, or RESEND_API_KEY, CONTACT_TO_EMAIL and " +
        "CONTACT_FROM_EMAIL to deliver them by email, in the deployment environment.",
      fallbackEmail: email.fallbackEmail || null,
    });
    return;
  }

  const payload = {
    ...validation.value,
    ip: clientIp(req),
    userAgent: (header(req, "user-agent") ?? "unknown").slice(0, 300),
  };

  const attempts: Promise<{ ok: boolean }>[] = [];
  if (store.configured) attempts.push(storeContactMessage(store, payload));
  if (email.configured) {
    attempts.push(sendContactEmail(email, { ...payload, receivedAt: new Date().toISOString() }));
  }

  const results = await Promise.all(attempts);

  if (!results.some((result) => result.ok)) {
    res.status(502).json({
      error: "delivery_failed",
      message: "The message could not be delivered right now. Please try again shortly.",
    });
    return;
  }

  res.status(200).json({ ok: true });
}

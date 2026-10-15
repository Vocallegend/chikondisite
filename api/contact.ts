/**
 * Contact form endpoint.
 *
 *   GET  /api/contact -> whether the provider is configured (no secrets)
 *   POST /api/contact -> rate-limit, validate, then deliver through Resend
 *
 * Everything is validated on the server with the same rules the browser uses
 * (`shared/contact.ts`). No configuration value is ever returned to the client
 * except the operator-chosen fallback address.
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
import { checkRateLimit } from "../server/rate-limit.js";

const LIMIT = 5; // messages
const WINDOW_SECONDS = 10 * 60; // per ten minutes, per IP

function configStatus() {
  const config = readContactConfig();
  return {
    configured: config.configured,
    // Present only when the operator set it; otherwise the UI hides the
    // fallback rather than showing an address nobody owns.
    fallbackEmail: config.fallbackEmail || null,
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

  const rate = await checkRateLimit({ key: clientIp(req), limit: LIMIT, windowSeconds: WINDOW_SECONDS });
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

  const config = readContactConfig();
  if (!config.configured) {
    res.status(503).json({
      error: "contact_not_configured",
      message:
        "The contact form is not connected to an email provider yet. Set RESEND_API_KEY, " +
        "CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL in the deployment environment.",
      fallbackEmail: config.fallbackEmail || null,
    });
    return;
  }

  const result = await sendContactEmail(config, {
    ...validation.value,
    ip: clientIp(req),
    userAgent: (header(req, "user-agent") ?? "unknown").slice(0, 300),
    receivedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    res.status(502).json({
      error: "delivery_failed",
      message: "The message could not be delivered right now. Please try again shortly.",
    });
    return;
  }

  res.status(200).json({ ok: true });
}

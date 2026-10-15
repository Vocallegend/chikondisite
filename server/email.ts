/**
 * Contact-form delivery.
 *
 * Delivery goes through Resend's HTTPS API using `fetch` — no SDK, no
 * dependency, nothing that can drift. When the provider is not configured the
 * endpoint says so plainly (503) instead of returning a fake success, and it
 * reports the operator-configured fallback address, if one exists, so the page
 * can offer it.
 *
 * Secrets live only in Vercel environment variables and are never sent to the
 * browser.
 */

export type ContactConfig = {
  configured: boolean;
  to: string;
  from: string;
  apiKey: string;
  fallbackEmail: string;
};

export function readContactConfig(env: NodeJS.ProcessEnv = process.env): ContactConfig {
  const apiKey = (env.RESEND_API_KEY ?? "").trim();
  const to = (env.CONTACT_TO_EMAIL ?? "").trim();
  const from = (env.CONTACT_FROM_EMAIL ?? "").trim();
  const fallbackEmail = (env.CONTACT_FALLBACK_EMAIL ?? "").trim();
  return {
    configured: Boolean(apiKey && to && from),
    to,
    from,
    apiKey,
    fallbackEmail,
  };
}

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  ip: string;
  userAgent: string;
  receivedAt: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderText(message: ContactMessage): string {
  return [
    `New Chikondi website message`,
    ``,
    `Category: ${message.category}`,
    `Name:     ${message.name}`,
    `Email:    ${message.email}`,
    `Subject:  ${message.subject}`,
    `Received: ${message.receivedAt}`,
    ``,
    message.message,
    ``,
    `---`,
    `IP: ${message.ip}`,
    `UA: ${message.userAgent}`,
  ].join("\n");
}

function renderHtml(message: ContactMessage): string {
  const rows: [string, string][] = [
    ["Category", message.category],
    ["Name", message.name],
    ["Email", message.email],
    ["Subject", message.subject],
    ["Received", message.receivedAt],
  ];
  return [
    `<h2 style="font-family:sans-serif">New Chikondi website message</h2>`,
    `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">`,
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="padding:2px 12px 2px 0;color:#666">${escapeHtml(k)}</td><td style="padding:2px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    ),
    `</table>`,
    `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap;background:#f6f6f8;padding:16px;border-radius:8px">${escapeHtml(message.message)}</pre>`,
    `<p style="font-family:sans-serif;font-size:12px;color:#888">IP ${escapeHtml(message.ip)} · ${escapeHtml(message.userAgent)}</p>`,
  ].join("\n");
}

export type SendResult = { ok: true } | { ok: false; status: number; detail: string };

/** Deliver through Resend. Never throws; returns a typed failure instead. */
export async function sendContactEmail(
  config: ContactConfig,
  message: ContactMessage,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  if (!config.configured) return { ok: false, status: 503, detail: "provider_not_configured" };
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: message.email,
        subject: `[Website · ${message.category}] ${message.subject}`,
        text: renderText(message),
        html: renderHtml(message),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      return { ok: false, status: response.status, detail: detail || "provider_error" };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      detail: error instanceof Error ? error.message.slice(0, 200) : "network_error",
    };
  }
}

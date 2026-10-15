/**
 * Website -> Supabase delivery for the contact form.
 *
 * The website is a separate deployment from the app and holds no Supabase user
 * session, so this writes with the service-role key from the serverless
 * function and never from the browser. The key is a secret and lives only in
 * Vercel environment variables.
 *
 * This is a second, independent delivery path alongside email. The form counts
 * as delivered when at least one path succeeds; when neither is configured the
 * endpoint says so (503) instead of pretending the message was sent. The row it
 * writes is what the Admin Control Centre reads (table
 * `public.website_contact_messages`, migration 20261016090000).
 */

export type StoreConfig = {
  configured: boolean;
  url: string;
  serviceKey: string;
};

export function readStoreConfig(env: NodeJS.ProcessEnv = process.env): StoreConfig {
  const url = (env.SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  return { configured: Boolean(url && serviceKey), url, serviceKey };
}

export type StoredMessage = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  ip: string;
  userAgent: string;
};

export type StoreResult = { ok: true } | { ok: false; status: number; detail: string };

/** Insert one row into public.website_contact_messages. Never throws. */
export async function storeContactMessage(
  config: StoreConfig,
  message: StoredMessage,
  fetchImpl: typeof fetch = fetch,
): Promise<StoreResult> {
  if (!config.configured) return { ok: false, status: 503, detail: "store_not_configured" };
  try {
    const response = await fetchImpl(`${config.url}/rest/v1/website_contact_messages`, {
      method: "POST",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: message.name,
        email: message.email,
        category: message.category,
        subject: message.subject,
        message: message.message,
        ip: message.ip,
        user_agent: message.userAgent,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      return { ok: false, status: response.status, detail: detail || "store_error" };
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

/**
 * Client half of the contact form.
 *
 * The browser validates for instant feedback and then posts to /api/contact,
 * which re-validates with the identical rules (both call shared/contact.ts). The
 * endpoint's answer is the only thing treated as truth: if delivery is not
 * configured, the page says so and shows the configured fallback instead of a
 * success message.
 */
import { validateContact } from "@shared/contact";

export type ContactStatus = { configured: boolean; fallbackEmail: string | null };

export type ContactErrors = Partial<
  Record<"name" | "email" | "subject" | "message" | "category", string>
>;

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: "validation"; errors: ContactErrors }
  | { ok: false; kind: "rate_limited"; message: string }
  | { ok: false; kind: "rejected"; message: string }
  | { ok: false; kind: "unconfigured"; message: string; fallbackEmail: string | null }
  | { ok: false; kind: "error"; message: string };

export async function fetchContactStatus(signal?: AbortSignal): Promise<ContactStatus> {
  try {
    const response = await fetch("/api/contact", {
      signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) return { configured: false, fallbackEmail: null };
    const data: unknown = await response.json();
    if (data && typeof data === "object") {
      const value = data as Record<string, unknown>;
      return {
        configured: value.configured === true,
        fallbackEmail: typeof value.fallbackEmail === "string" ? value.fallbackEmail : null,
      };
    }
  } catch {
    /* unreachable endpoint is treated as unconfigured */
  }
  return { configured: false, fallbackEmail: null };
}

/** The same validation the server runs, for inline errors while typing. */
export const localValidation = validateContact;

export async function submitContact(payload: Record<string, unknown>): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      kind: "error",
      message: "We could not reach the server. Please check your connection and try again.",
    };
  }

  let data: Record<string, unknown> = {};
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
  } catch {
    /* leave data empty */
  }

  if (response.ok) return { ok: true };

  const error = typeof data.error === "string" ? data.error : "";
  const message = typeof data.message === "string" ? data.message : "";

  if (response.status === 400 && data.fields && typeof data.fields === "object") {
    return { ok: false, kind: "validation", errors: data.fields as ContactErrors };
  }
  if (response.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      message: message || "Too many messages. Please try again later.",
    };
  }
  if (error === "rejected") {
    return { ok: false, kind: "rejected", message: message || "That submission was rejected." };
  }
  if (response.status === 503 || error === "contact_not_configured") {
    return {
      ok: false,
      kind: "unconfigured",
      message:
        message ||
        "The contact form is not connected to a mail provider yet. Please use the address below instead.",
      fallbackEmail: typeof data.fallbackEmail === "string" ? data.fallbackEmail : null,
    };
  }
  return {
    ok: false,
    kind: "error",
    message: message || "Something went wrong sending your message. Please try again shortly.",
  };
}

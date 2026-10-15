/**
 * Contact form contract — shared by the Contact page and /api/contact.
 *
 * The client uses `validateContact` for instant, accessible inline errors; the
 * server runs the exact same function so a request that skips the browser gets
 * the identical verdict. Spam handling is layered and honest: a honeypot field,
 * a minimum time-to-submit, and — when Upstash credentials are configured — a
 * shared sliding-window rate limit. None of it is a promise that no spam can
 * ever arrive.
 */

export const CONTACT_CATEGORIES = [
  "Download problem",
  "Installation problem",
  "Account problem",
  "Security concern",
  "Bug report",
  "General enquiry",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  /** Must stay empty. A bot fills it; a person never sees it. */
  company?: string;
  /** Client timestamp of when the form was rendered (ms since epoch). */
  startedAt?: number;
};

export type ContactField = "name" | "email" | "subject" | "message" | "category";
export type ContactValidation =
  | { ok: true; value: Required<Pick<ContactInput, "name" | "email" | "subject" | "message">> & { category: string } }
  | { ok: false; errors: Partial<Record<ContactField, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 254, subject: 160, message: 5000 } as const;

export function validateContact(raw: Record<string, unknown>): ContactValidation {
  const errors: Partial<Record<ContactField, string>> = {};

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > MAX.name) errors.name = `Please keep your name under ${MAX.name} characters.`;

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > MAX.email || !EMAIL_RE.test(email))
    errors.email = "Please enter a valid email address.";

  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  if (subject.length < 3) errors.subject = "Please add a short subject.";
  else if (subject.length > MAX.subject)
    errors.subject = `Please keep the subject under ${MAX.subject} characters.`;

  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  if (message.length < 20)
    errors.message = "Please describe your message in at least 20 characters.";
  else if (message.length > MAX.message)
    errors.message = `Please keep your message under ${MAX.message} characters.`;

  let category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) category = "General enquiry";
  if (!CONTACT_CATEGORIES.includes(category as (typeof CONTACT_CATEGORIES)[number]))
    errors.category = "Please choose a valid category.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, email, subject, message, category } };
}

/**
 * Cheap, honest anti-abuse signals, evaluated by the server only.
 *
 * A honeypot that is filled, or a submission faster than a human can read the
 * labels, is dropped. This is not a substitute for a rate limit and is not
 * presented as one.
 */
export function spamSignal(raw: Record<string, unknown>, nowMs: number): string | null {
  const honey = raw.company;
  if (typeof honey === "string" && honey.trim().length > 0) return "honeypot";

  const startedAt = typeof raw.startedAt === "number" ? raw.startedAt : NaN;
  if (Number.isFinite(startedAt)) {
    const elapsed = nowMs - startedAt;
    if (elapsed >= 0 && elapsed < 1500) return "too_fast";
    // A clock far in the future or a form left open for weeks: treat as suspect.
    if (elapsed < 0 || elapsed > 1000 * 60 * 60 * 24 * 7) return "stale";
  }
  return null;
}

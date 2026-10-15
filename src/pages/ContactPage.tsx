import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { CONTACT_CATEGORIES } from "@shared/contact";
import {
  fetchContactStatus,
  localValidation,
  submitContact,
  type ContactErrors,
  type ContactStatus,
} from "@/lib/contact";

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  contactReference: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  category: "General enquiry",
  subject: "",
  message: "",
  contactReference: "",
};

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white " +
  "placeholder:text-ink-500 transition focus:border-brand-400 focus:outline-none";

const labelClass = "block text-sm font-medium text-ink-200";

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-xs text-brand-200">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

type Status = "idle" | "submitting" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [provider, setProvider] = useState<ContactStatus | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const controller = new AbortController();
    void fetchContactStatus(controller.signal).then((next) => {
      if (!controller.signal.aborted) setProvider(next);
    });
    return () => controller.abort();
  }, []);

  const field =
    (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((previous) => ({ ...previous, [key]: value }));
    };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const raw = {
      name: form.name,
      email: form.email,
      category: form.category,
      subject: form.subject,
      message: form.message,
      contactReference: form.contactReference,
      startedAt: startedAt.current,
    };

    const validation = localValidation(raw);
    if (!validation.ok) {
      setErrors(validation.errors);
      setFeedback(null);
      return;
    }
    setErrors({});
    setFeedback(null);
    setStatus("submitting");

    const result = await submitContact(raw);

    if (result.ok) {
      setStatus("sent");
      setForm(EMPTY_FORM);
      setFallback(null);
      return;
    }
    if (result.kind === "validation") {
      setErrors(result.errors);
      setStatus("idle");
      return;
    }
    if (result.kind === "unconfigured") {
      setStatus("error");
      setFallback(result.fallbackEmail);
      setFeedback(result.message);
      return;
    }
    setStatus("error");
    setFeedback(result.message);
  };

  const submitting = status === "submitting";
  const sent = status === "sent";
  const errorCount = Object.keys(errors).length;

  return (
    <PageShell path="/contact">
      <PageHero
        title="Contact Chikondi"
        lead="Download or installation trouble, a security concern, a bug, or a question we have not answered — send it here and we will read it."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div>
            {sent ? (
              <Notice tone="success" title="Message sent">
                Thank you — your message reached us. If you gave an email address, we will reply
                there.
              </Notice>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-6">
                {status === "error" && feedback && (
                  <Notice tone="danger" title="Message not sent">
                    {feedback}
                    {fallback && (
                      <>
                        {" "}
                        You can reach us at{" "}
                        <a
                          href={`mailto:${fallback}`}
                          className="font-semibold underline underline-offset-2"
                        >
                          {fallback}
                        </a>
                        .
                      </>
                    )}
                  </Notice>
                )}

                {errorCount > 0 && (
                  <Notice tone="warning" title="Please check the highlighted fields">
                    Nothing was submitted. Correct the {errorCount === 1 ? "item" : "items"} marked
                    below and send again.
                  </Notice>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={field("name")}
                      aria-invalid={Boolean(errors.name) || undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={inputClass}
                    />
                    {errors.name && <FieldError id="contact-name-error">{errors.name}</FieldError>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={labelClass}>
                      Email address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={field("email")}
                      aria-invalid={Boolean(errors.email) || undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={inputClass}
                    />
                    {errors.email && <FieldError id="contact-email-error">{errors.email}</FieldError>}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-category" className={labelClass}>
                      What is this about?
                    </label>
                    <select
                      id="contact-category"
                      name="category"
                      value={form.category}
                      onChange={field("category")}
                      className={inputClass}
                    >
                      {CONTACT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className={labelClass}>
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={field("subject")}
                      aria-invalid={Boolean(errors.subject) || undefined}
                      aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                      className={inputClass}
                    />
                    {errors.subject && (
                      <FieldError id="contact-subject-error">{errors.subject}</FieldError>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    Your message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={8}
                    required
                    value={form.message}
                    onChange={field("message")}
                    aria-invalid={Boolean(errors.message) || undefined}
                    aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
                    className={inputClass}
                  />
                  {errors.message ? (
                    <FieldError id="contact-message-error">{errors.message}</FieldError>
                  ) : (
                    <p id="contact-message-hint" className="mt-2 text-xs text-ink-500">
                      Include your phone model and Android version if the issue is on the app. Please
                      never send passwords.
                    </p>
                  )}
                </div>

                {/* Trap field. Hidden from people; only a bot fills it.
                    It is deliberately NOT named anything an address autofill
                    recognises (a field called "company" was being autofilled
                    from saved addresses, which looked exactly like spam), and
                    any value that still reaches it is discarded so a person's
                    browser can never trip it. */}
                <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
                  <label htmlFor="contact-reference">Leave this field empty</label>
                  <input
                    id="contact-reference"
                    name="contact_reference"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={form.contactReference}
                    onChange={() =>
                      setForm((previous) =>
                        previous.contactReference === ""
                          ? previous
                          : { ...previous, contactReference: "" },
                      )
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" aria-hidden="true" />
                        Send message
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-ink-500">We use your message only to reply to you.</p>
                </div>

                {errorCount > 0 && (
                  <p className="sr-only" role="alert">
                    {errorCount} field{errorCount === 1 ? "" : "s"} need attention.
                  </p>
                )}
              </form>
            )}
          </div>

          <aside className="space-y-5">
            {provider && provider.configured === false && (
              <Notice tone="warning" title="Messaging is currently unavailable">
                {provider.fallbackEmail ? (
                  <>
                    The contact form is not connected on this deployment. Please email{" "}
                    <a
                      href={`mailto:${provider.fallbackEmail}`}
                      className="font-semibold text-brand-300 underline underline-offset-2"
                    >
                      {provider.fallbackEmail}
                    </a>
                    .
                  </>
                ) : (
                  "The contact form is not connected on this deployment. Please try again later."
                )}
              </Notice>
            )}

            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
              <h2 className="text-base font-semibold text-white">Before you write</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-300">
                <li>
                  Download or install problem? The{" "}
                  <a href="/install" className="text-brand-300 underline-offset-2 hover:underline">
                    installation guide
                  </a>{" "}
                  covers most of them.
                </li>
                <li>Locked out? Try the password reset on the app's sign-in screen first.</li>
                <li>
                  Safety concern about a member? Use the in-app report tool — it reaches the
                  moderation team with the conversation attached.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
              <h2 className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Response time
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                We aim to reply within a few working days. Security reports are prioritised.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
              <h2 className="text-base font-semibold text-white">Emergencies</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                If you are in immediate danger, contact your local emergency services directly.
                Chikondi is not an emergency-response service.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </PageShell>
  );
}

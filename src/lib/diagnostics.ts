/**
 * Production-safe diagnostics for the website.
 *
 * /boot.js (public/boot.js) attaches the global listeners before the app
 * bundle runs, so errors that happen while the bundle is still downloading —
 * or when it never arrives — are already captured. This module is the app-side
 * half: it installs the same listeners if boot.js was missing, and gives
 * application code one place to record a problem that is not a thrown error,
 * such as a timed-out optional request.
 *
 * Everything is console plus a bounded in-memory buffer
 * (window.__chikondiDiagnostics). No request is sent anywhere, so no paid
 * monitoring, no new dependency, and nothing that could leak a token or a
 * visitor's data off the device.
 */

export type DiagnosticKind =
  "boot" | "error" | "unhandledrejection" | "asset" | "network" | "timeout" | "render";

type Diagnostic = {
  kind: DiagnosticKind;
  message: string;
  source?: string;
  at: string;
};

declare global {
  interface Window {
    __chikondiDiagnostics?: Diagnostic[];
    __chikondiDiagnosticsInstalled?: boolean;
  }
}

const MAX_ENTRIES = 50;

function truncate(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

function buffer(): Diagnostic[] {
  if (!window.__chikondiDiagnostics) window.__chikondiDiagnostics = [];
  return window.__chikondiDiagnostics;
}

/** Record one diagnostic. Never throws: reporting must not break the page. */
export function reportDiagnostic(kind: DiagnosticKind, message: string, source?: string): void {
  try {
    const entry: Diagnostic = {
      kind,
      message: truncate(message, 400),
      source: source ? truncate(source, 200) : undefined,
      at: new Date().toISOString(),
    };
    const entries = buffer();
    entries.push(entry);
    if (entries.length > MAX_ENTRIES) entries.shift();
    console.error("[chikondi]", `${kind}:`, entry.message, entry.source ?? "");
  } catch {
    /* a broken console must not break the page */
  }
}

/**
 * Attach the global listeners, unless boot.js already did.
 *
 * Called once from main.tsx before the first render, so an exception thrown
 * during initial render is recorded too (React reports render errors to the
 * console itself, but only when a development build is in use).
 */
export function installDiagnostics(): void {
  if (typeof window === "undefined" || window.__chikondiDiagnosticsInstalled) return;
  window.__chikondiDiagnosticsInstalled = true;

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as Element | null;
      if (target && (target as Node).nodeType === 1) {
        const url = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || "";
        reportDiagnostic("asset", `${target.tagName} failed to load${url ? `: ${url}` : ""}`, url);
        return;
      }
      reportDiagnostic("error", event.message || "Uncaught error", event.filename);
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string; stack?: string } | undefined;
    reportDiagnostic(
      "unhandledrejection",
      reason?.message ?? String(reason ?? "Promise rejected"),
      reason?.stack,
    );
  });
}

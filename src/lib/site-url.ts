/**
 * Absolute URL helpers.
 *
 * The site never hardcodes a domain. `SITE_URL` is set by the operator (see
 * .env.example); in the browser the current origin is the honest fallback, and
 * at build time scripts/prerender-meta.mjs uses SITE_URL or the Vercel-provided
 * production URL.
 */

/** The site's own origin, without a trailing slash. May be "" if unknown. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) return configured.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/** Turn a root-relative path into an absolute URL when the origin is known. */
export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalised}` : normalised;
}

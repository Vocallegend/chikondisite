import { useEffect } from "react";
import { Compass, Download, Home } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { primaryNav } from "@/data/site";

/**
 * A real 404 page.
 *
 * It is reached both by an unknown client-side route and (because Vercel
 * rewrites unknown paths to index.html) by a mistyped deep link. It never
 * pretends the requested page exists, and it is marked noindex so a broken URL
 * cannot end up in a search result.
 */
export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found — Chikondi";

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, follow");
  }, []);

  return (
    <>
      <PageHero
        eyebrow="404"
        title="That page is not here"
        lead="The link may be mistyped, or the page may have moved. Everything on this site is one tap away below."
        actions={
          <>
            <ButtonLink to="/" size="lg">
              <Home className="h-5 w-5" aria-hidden="true" />
              Back to the homepage
            </ButtonLink>
            <ButtonLink to="/download" variant="secondary" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download Chikondi
            </ButtonLink>
          </>
        }
      />

      <Section eyebrow="Popular pages" title="Where you might have been going">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primaryNav
            .filter((item) => item.to !== "/")
            .map((item) => (
              <a
                key={item.to}
                href={item.to}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-5 transition-colors hover:border-white/25"
              >
                <Compass className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <span className="text-base font-semibold text-white">{item.label}</span>
              </a>
            ))}
          <a
            href="/download"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-5 transition-colors hover:border-white/25"
          >
            <Download className="h-5 w-5 text-brand-300" aria-hidden="true" />
            <span className="text-base font-semibold text-white">Download</span>
          </a>
        </div>
      </Section>
    </>
  );
}

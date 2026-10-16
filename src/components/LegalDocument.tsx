import { AlertTriangle, ListChecks } from "lucide-react";
import { LEGAL_CONFIG_READY, type LegalDocument as LegalDocumentType } from "@/data/legal";
import { formatDate } from "@/lib/release";

/**
 * Render one legal document.
 *
 * Two deliberate choices:
 *
 *   * The "in short" box is a condensation of the sections below it, shown first
 *     because that is the part people actually read.
 *   * While the operator has not supplied a legal entity, an address and a
 *     contact address, an explicit notice says so. It is better to tell a
 *     visitor that a document is not yet finalised than to publish a policy that
 *     reads as complete when it is not.
 */
export function LegalDocument({ document }: { document: LegalDocumentType }) {
  return (
    <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:py-20">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-xs font-semibold tracking-[0.18em] text-ink-500 uppercase">
            On this page
          </p>
          <ul className="mt-4 space-y-2 border-l border-white/10 pl-4">
            <li>
              <a href="#in-short" className="text-sm text-ink-400 hover:text-white">
                In short
              </a>
            </li>
            {document.sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${slug(section.heading)}`}
                  className="text-sm text-ink-400 hover:text-white"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-600">
            Version {document.version}
            <br />
            Effective {formatDate(document.effectiveDate)}
          </p>
        </div>
      </nav>

      <article className="max-w-3xl">
        <header className="border-b border-white/10 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            Version {document.version} · Effective {formatDate(document.effectiveDate)} · Last
            updated {formatDate(document.lastUpdated)}
          </p>
          <p className="mt-5 text-base leading-relaxed text-ink-300">{document.intro}</p>
        </header>

        {!LEGAL_CONFIG_READY && (
          <div className="mt-8 flex gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/8 p-5 text-sm leading-relaxed text-ink-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">This document is not yet finalised</p>
              <p className="mt-1 text-ink-200">
                The operator details this policy refers to — the legal entity, its registered
                address and the contact address for privacy requests — have not been configured
                yet. The wording below is the current draft; do not treat it as an executed policy
                until those details appear here.
              </p>
            </div>
          </div>
        )}

        <section id="in-short" className="mt-10 scroll-under-header">
          <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <ListChecks className="h-5 w-5 text-brand-300" aria-hidden="true" />
              In short
            </h2>
            <ul className="mt-4 space-y-2.5">
              {document.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-ink-200">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-12 space-y-10">
          {document.sections.map((section) => (
            <section key={section.heading} id={slug(section.heading)} className="scroll-under-header">
              <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
              {section.body && (
                <p className="mt-3 text-base leading-relaxed text-ink-300">{section.body}</p>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-base leading-relaxed text-ink-300">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-600"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

import { useParams } from "react-router-dom";
import { LegalDocument } from "@/components/LegalDocument";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { DownloadCta } from "@/components/DownloadCta";
import {
  getLegalDocument,
  LEGAL_EXTRA_KEYS,
  LEGAL_ROUTE_TO_KEY,
  type LegalDocument as LegalDocumentType,
} from "@/data/legal";
import NotFoundPage from "./NotFoundPage";

/** The extra policies served under /legal/<slug>, in the order they read best. */
const ORDER: readonly string[] = LEGAL_EXTRA_KEYS;

export default function LegalDetailPage() {
  const { slug = "" } = useParams();
  const key = LEGAL_ROUTE_TO_KEY[slug];
  const document: LegalDocumentType | undefined = ORDER.includes(slug) && key
    ? getLegalDocument(key)
    : undefined;

  if (!document) return <NotFoundPage />;

  return (
    <PageShell path={`/legal/${slug}`} canonicalPath={`/legal/${document.key}`}>
      <LegalDocument document={document} />

      <Section tone="muted" eyebrow="Related reading" title="Other Chikondi policies">
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="/privacy"
            className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-colors hover:border-white/25"
          >
            <h3 className="text-base font-semibold text-white">Privacy Policy</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              What we collect, why, and the control you have over it.
            </p>
          </a>
          <a
            href="/terms"
            className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-colors hover:border-white/25"
          >
            <h3 className="text-base font-semibold text-white">Terms of Service</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              The rules that govern your use of Chikondi.
            </p>
          </a>
          <a
            href="/guidelines"
            className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-colors hover:border-white/25"
          >
            <h3 className="text-base font-semibold text-white">Community Guidelines</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              The standards that keep Chikondi respectful and safe.
            </p>
          </a>
        </div>
      </Section>

      <DownloadCta title="Download Chikondi" />
    </PageShell>
  );
}

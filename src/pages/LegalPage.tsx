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

/** Friendly URL -> document key, plus the label used in the cross-links. */
const OTHER_DOCUMENTS: { to: string; label: string; key: string }[] = [
  { to: "/privacy", label: "Privacy Policy", key: "privacy" },
  { to: "/terms", label: "Terms of Service", key: "terms" },
  { to: "/guidelines", label: "Community Guidelines", key: "community-guidelines" },
];

const EXTRA_LABELS: Record<string, string> = {
  "safety-policy": "Safety Policy",
  "data-retention": "Data Retention Policy",
  "law-enforcement": "Law Enforcement Policy",
};

type LegalPagePath = "/privacy" | "/terms" | "/guidelines";

/**
 * One of the three headline legal documents.
 *
 * The wording itself lives in `src/data/legal.ts` — the same registry the
 * Android app renders — so the website and the app cannot drift apart. This
 * component only decides which document to show and what to link to next.
 */
export default function LegalPage({ page }: { page: LegalPagePath }) {
  const key = LEGAL_ROUTE_TO_KEY[page.slice(1)];
  const document = key ? getLegalDocument(key) : undefined;

  if (!document) return <NotFoundPage />;

  const extras: LegalDocumentType[] = LEGAL_EXTRA_KEYS.map((slug) =>
    getLegalDocument(LEGAL_ROUTE_TO_KEY[slug]),
  ).filter((doc): doc is LegalDocumentType => Boolean(doc));

  return (
    <PageShell path={page}>
      <LegalDocument document={document} />

      <Section tone="muted" eyebrow="More documents" title="The policies behind Chikondi">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OTHER_DOCUMENTS.filter((entry) => entry.key !== document.key).map((entry) => (
            <a
              key={entry.to}
              href={entry.to}
              className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-colors hover:border-white/25"
            >
              <h3 className="text-base font-semibold text-white">{entry.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                {entry.key === "privacy" && "What we collect, why, and the control you have."}
                {entry.key === "terms" && "The rules that govern your use of Chikondi."}
                {entry.key === "community-guidelines" &&
                  "The standards every member agrees to keep."}
              </p>
            </a>
          ))}
          {extras.map((entry) => (
            <a
              key={entry.key}
              href={`/legal/${entry.key}`}
              className="rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-colors hover:border-white/25"
            >
              <h3 className="text-base font-semibold text-white">
                {EXTRA_LABELS[entry.key] ?? entry.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{entry.intro}</p>
            </a>
          ))}
        </div>
      </Section>

      <DownloadCta title="Questions about a policy?" lead="Send them through the Contact page and we will answer." />
    </PageShell>
  );
}

import { LifeBuoy } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Accordion } from "@/components/Accordion";
import { DownloadCta } from "@/components/DownloadCta";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { faqGroups } from "@/data/support";

export default function FaqPage() {
  return (
    <PageShell path="/faq">
      <PageHero
        title="Frequently asked questions"
        lead="Downloading, installing, updating and staying safe — answered plainly. If something is missing, tell us."
        actions={
          <ButtonLink to="/help" variant="secondary" size="lg">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
            Browse the help centre
          </ButtonLink>
        }
      />

      {faqGroups.map((group, index) => (
        <Section
          key={group.title}
          title={group.title}
          tone={index % 2 === 1 ? "muted" : "default"}
        >
          <Accordion
            className="max-w-3xl"
            items={group.items.map((item) => ({
              id: `${group.title}-${item.question}`,
              question: item.question,
              children: <p>{item.answer}</p>,
            }))}
          />
        </Section>
      ))}

      <Section tone={faqGroups.length % 2 === 1 ? "muted" : "default"}>
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Question not answered here?</h2>
            <p className="mt-1 text-sm text-ink-300">
              Send it to us. We read every message that comes through the contact form.
            </p>
          </div>
          <ButtonLink to="/contact" size="lg" className="shrink-0">
            Contact us
          </ButtonLink>
        </div>
      </Section>

      <DownloadCta />
    </PageShell>
  );
}

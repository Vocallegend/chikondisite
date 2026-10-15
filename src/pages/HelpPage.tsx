import { LifeBuoy } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { helpArticles } from "@/data/support";

export default function HelpPage() {
  return (
    <PageShell path="/help">
      <PageHero
        title="Help centre"
        lead="Straight answers for downloading, installing, updating and using Chikondi. If your question is not here, the contact form is one tap away."
        actions={
          <ButtonLink to="/contact" size="lg">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
            Contact support
          </ButtonLink>
        }
      />

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:py-20">
        <nav aria-label="Help topics" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-[0.18em] text-ink-500 uppercase">Topics</p>
          <ul className="mt-4 space-y-2 border-l border-white/10 pl-4">
            {helpArticles.map((article) => (
              <li key={article.id}>
                <a href={`#${article.id}`} className="text-sm text-ink-400 hover:text-white">
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-14">
          {helpArticles.map((article) => (
            <section key={article.id} id={article.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold text-white">{article.title}</h2>
              <p className="mt-2 text-base leading-relaxed text-ink-400">{article.summary}</p>
              <ol className="mt-5 space-y-3">
                {article.steps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-ink-100">
                      {index + 1}
                    </span>
                    <span className="text-base leading-relaxed text-ink-200">{step}</span>
                  </li>
                ))}
              </ol>
              {article.note && (
                <Notice tone="info" className="mt-5">
                  {article.note}
                </Notice>
              )}
            </section>
          ))}
        </div>
      </div>

      <Section tone="muted">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-ink-950/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Still stuck?</h2>
            <p className="mt-1 text-sm text-ink-300">
              Tell us what you tried and what happened. Include your phone model and Android version
              if the problem is on the app.
            </p>
          </div>
          <ButtonLink to="/contact" size="lg" className="shrink-0">
            Contact us
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}

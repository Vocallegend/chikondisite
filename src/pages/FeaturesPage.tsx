import { Download, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { DownloadCta } from "@/components/DownloadCta";
import { FeatureIcon } from "@/components/FeatureIcon";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { PhoneMockup } from "@/components/PhoneMockup";
import { features } from "@/data/features";
import { site } from "@/data/site";

export default function FeaturesPage() {
  return (
    <PageShell path="/features">
      <PageHero
        title="What you can do in Chikondi"
        lead="A dating app earns its place on your phone by being useful on a Tuesday night, not by having a long feature list. Here is what Chikondi actually does."
        actions={
          <>
            <ButtonLink to="/download" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download Chikondi
            </ButtonLink>
            <ButtonLink to="/how-it-works" variant="secondary" size="lg">
              How it works
            </ButtonLink>
          </>
        }
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 0.05}>
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/40 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-300">
                  <FeatureIcon name={feature.icon} className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{feature.summary}</p>
                <ul className="mt-4 space-y-2">
                  {feature.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-ink-400">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
              Built for the phone in your hand
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Small download, works on the phones people actually own
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-300">
              Chikondi is an Android app built for the market it serves. It installs from this
              website in a few seconds on a normal connection, runs on Android{" "}
              {site.android.minVersion} and above, and does not need an app store account to work.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Direct download — no Play Store, no store account",
                "Updates install over the previous version without losing your account",
                "Signed with a single, consistent certificate so updates stay trustworthy",
                "Row-level security on the server protects your data from other members",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-300">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink to="/install" variant="secondary">
                Installation guide
              </ButtonLink>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <PhoneMockup
              src="/app/what-to-expect.jpg"
              alt="Chikondi onboarding artwork about what to expect"
            />
          </div>
        </div>
      </Section>

      <DownloadCta title="Ready to try it?" lead="Download the official Chikondi APK and set up your profile in a few minutes." />
    </PageShell>
  );
}

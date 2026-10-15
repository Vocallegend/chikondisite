import type { ReactNode } from "react";
import { ArrowRight, Download, ShieldCheck, Smartphone, Sparkles, Users } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { DownloadPanel } from "@/components/DownloadPanel";
import { FeatureIcon } from "@/components/FeatureIcon";
import { Notice } from "@/components/Notice";
import { PhoneMockup } from "@/components/PhoneMockup";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { PageShell } from "@/components/PageShell";
import { DownloadCta } from "@/components/DownloadCta";
import { features } from "@/data/features";
import { site } from "@/data/site";
import { bundledLatest, formatBytes, formatDate, useLatestRelease } from "@/lib/release";

export default function HomePage() {
  const releaseState = useLatestRelease();

  return (
    <PageShell path="/">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-brand-600/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-3xl"
        />

        <div className="container-page relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:py-28">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-ink-200">
                <Smartphone className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                Android · direct download
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-500">
                18+
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Real connections start with{" "}
              <span className="bg-gradient-to-br from-brand-300 via-brand-400 to-brand-600 bg-clip-text text-transparent">
                Chikondi
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              {site.description} Meet people nearby, match with the ones who feel right, and take
              the conversation from there.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/download" size="lg">
                <Download className="h-5 w-5" aria-hidden="true" />
                Download for Android
              </ButtonLink>
              <ButtonLink to="/how-it-works" variant="secondary" size="lg">
                See how it works
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Fact
                icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                term="Current version"
                detail={bundledLatest ? bundledLatest.versionName : "See download page"}
              />
              <Fact
                icon={<Smartphone className="h-4 w-4" aria-hidden="true" />}
                term="Download size"
                detail={bundledLatest ? formatBytes(bundledLatest.fileSize) : "See download page"}
              />
              <Fact
                icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                term="Works on"
                detail={`Android ${bundledLatest?.minimumAndroidVersion ?? site.android.minVersion}+`}
              />
            </dl>

            {bundledLatest && (
              <p className="mt-6 text-xs text-ink-500">
                Released {formatDate(bundledLatest.releaseDate)} ·{" "}
                <a
                  href="/releases"
                  className="text-brand-300 underline-offset-2 hover:underline"
                >
                  release notes
                </a>
              </p>
            )}
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative flex items-end gap-4">
              <PhoneMockup
                src="/app/connect-safely.jpg"
                alt="Chikondi onboarding artwork about connecting safely"
                className="hidden translate-y-8 sm:flex"
              />
              <PhoneMockup
                src="/app/welcome.jpg"
                alt="Chikondi welcome artwork"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <Section
        eyebrow="What you can do"
        title="Everything you need to meet someone"
        lead="Chikondi keeps the essentials — discovering people, matching, messaging and staying in control — without burying any of it."
        tone="muted"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 6).map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.04}>
              <article className="h-full rounded-2xl border border-white/10 bg-ink-950/60 p-6 transition-colors hover:border-white/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-300">
                  <FeatureIcon name={feature.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{feature.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink to="/features" variant="secondary">
            See all features
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </Section>

      {/* --------------------------------------------------------- How it works */}
      <Section
        eyebrow="How it works"
        title="Four steps from download to first message"
        lead="No mystery, no gamified hoops. Here is the whole path."
      >
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Download the app",
              body: "Get the official APK from this website and install it on your Android phone.",
            },
            {
              title: "Create your account",
              body: "Sign up with your email, confirm you are 18 or over, and you are in.",
            },
            {
              title: "Build your profile",
              body: "Add photos, a short bio and what you are looking for. Set your preferences.",
            },
            {
              title: "Start connecting",
              body: "Discover people nearby, like the ones you like, and message when you match.",
            },
          ].map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-white/10 bg-ink-900/40 p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <ButtonLink to="/how-it-works" variant="secondary">
            Read the full walkthrough
          </ButtonLink>
        </div>
      </Section>

      {/* -------------------------------------------------------------- Safety */}
      <Section tone="muted">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
              Safety
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built to keep you in control
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-300">
              Blocking is enforced on the server, reporting goes to a human, and the app is for
              adults only. Chikondi will not tell you that meeting someone is risk-free — because it
              is not — but it gives you the tools and the guidance to go in with your eyes open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/safety" variant="secondary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Safety and privacy
              </ButtonLink>
              <ButtonLink to="/guidelines" variant="ghost">
                Community guidelines
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Blocking that holds", body: "Enforced on the server, not just hidden on your phone." },
              { body: "Every report is reviewed by a person, with an audit trail.", title: "Human moderation" },
              { title: "Adults only", body: "18+ is checked against your date of birth, not a tick box." },
              { body: "Other members cannot see your email, phone or exact location.", title: "Private by design" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-950/60 p-5">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Download */}
      <Section
        eyebrow="Get the app"
        title="Download the official Chikondi APK"
        lead="Installed straight from this website. Check the version and checksum below before you install."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <DownloadPanel state={releaseState} />
          <div className="space-y-5">
            <Notice tone="info" title="Installing outside an app store">
              Android asks for confirmation when you install an app that did not come from an app
              store. That is normal. Never disable Play Protect to install anything — our{" "}
              <a href="/install" className="text-brand-300 underline-offset-2 hover:underline">
                installation guide
              </a>{" "}
              walks through it safely.
            </Notice>
            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white">Updating is safe</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                Installing a newer APK over the one you have keeps your account, matches and
                conversations. They live on Chikondi's servers, not on your phone.
              </p>
              <a
                href="/releases"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
              >
                View release notes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
              <h3 className="text-base font-semibold text-white">Before you install</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-300">
                <li>Requires Android {site.android.minVersion} or newer</li>
                <li>Downloads directly from this website</li>
                <li>Free — no app store account, no Play Store required</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <DownloadCta />
    </PageShell>
  );
}

function Fact({
  icon,
  term,
  detail,
}: {
  icon: ReactNode;
  term: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
        <span className="text-brand-300">{icon}</span>
        {term}
      </dt>
      <dd className="mt-1.5 text-base font-semibold text-white">{detail}</dd>
    </div>
  );
}

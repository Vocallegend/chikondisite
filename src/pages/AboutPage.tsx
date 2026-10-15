import { Ban, Heart, ShieldCheck, Smartphone } from "lucide-react";
import { DownloadCta } from "@/components/DownloadCta";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { LEGAL_CONFIG_READY, LEGAL_PLACEHOLDERS } from "@/data/legal";
import { bundledLatest, formatDate } from "@/lib/release";

export default function AboutPage() {
  return (
    <PageShell path="/about">
      <PageHero
        title="About Chikondi"
        lead="Chikondi is an Android dating app for adults who want to meet people nearby and build something real."
      />

      <Section eyebrow="Why it exists" title="Dating, without the noise">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-ink-300">
            <p>
              Chikondi was built around a simple idea: the hardest part of dating is not finding
              thousands of people, it is finding the few worth talking to. So the app keeps the
              mechanics simple — discover, like, match, message — and puts its effort into making
              those steps feel honest.
            </p>
            <p>
              That means a profile you can actually read, preferences that reflect what you want
              rather than what keeps you scrolling, and safety tools that work the same way after a
              reinstall. It also means being clear about the things dating apps usually leave vague:
              we do not run background checks, we cannot verify everyone's intentions, and we are
              not an emergency service.
            </p>
            <p>
              Chikondi is for adults, 18 and over. That rule is enforced, not requested.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Heart,
                title: "Connections first",
                body: "A small set of things done well, rather than an endless feature list.",
              },
              {
                icon: ShieldCheck,
                title: "Safety that is enforced",
                body: "Blocking and the age rule are enforced on the server, not just in the interface.",
              },
              {
                icon: Smartphone,
                title: "Made for Android, distributed directly",
                body: "You download the app from this website. No app store account is required to use Chikondi.",
              },
              {
                icon: Ban,
                title: "No pay-to-be-seen tricks",
                body: "Your matches come from who likes you back, not from how much you spend.",
              },
            ].map((value) => (
              <div key={value.title} className="rounded-2xl border border-white/10 bg-ink-900/40 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <value.icon className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="muted" eyebrow="How it is made" title="Built and shipped with care">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "One app, one identity",
              body: "Every release is signed with the same certificate, so updates install cleanly over the version you already have.",
            },
            {
              title: "Direct distribution",
              body: "Chikondi is not published on an app store. The only official source for the APK is this website.",
            },
            {
              title: "Updates you control",
              body: "You update when you choose. Downloading a new version never touches your account or your conversations.",
            },
            {
              title: "Privacy at the database",
              body: "Row-level security means other members cannot read your details even if they try to.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-950/60 p-5">
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.body}</p>
            </div>
          ))}
        </div>
        {bundledLatest && (
          <p className="mt-8 text-sm text-ink-500">
            Current release: version {bundledLatest.versionName}, published{" "}
            {formatDate(bundledLatest.releaseDate)}.{" "}
            <a href="/releases" className="text-brand-300 underline-offset-2 hover:underline">
              Release notes
            </a>
          </p>
        )}
      </Section>

      <Section eyebrow="Who operates Chikondi" title="Company details">
        {LEGAL_CONFIG_READY ? (
          <dl className="grid max-w-2xl gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Legal entity
              </dt>
              <dd className="mt-1.5 text-base text-white">{LEGAL_PLACEHOLDERS.LEGAL_ENTITY_NAME}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Registered address
              </dt>
              <dd className="mt-1.5 text-base text-white">
                {LEGAL_PLACEHOLDERS.REGISTERED_ADDRESS}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Contact</dt>
              <dd className="mt-1.5 text-base text-white">{LEGAL_PLACEHOLDERS.LEGAL_CONTACT_EMAIL}</dd>
            </div>
          </dl>
        ) : (
          <div className="max-w-2xl">
            <Notice tone="info" title="Operator details are not published yet">
              The legal entity behind Chikondi, its registered address and a contact address have
              not been configured. Rather than invent a company history, an office or an address,
              this page says nothing about them. Support questions can be sent through the{" "}
              <a href="/contact" className="text-brand-300 underline-offset-2 hover:underline">
                Contact page
              </a>{" "}
              in the meantime.
            </Notice>
          </div>
        )}
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-500">
          Chikondi is the name of the app. Android and Google Play are trademarks of Google LLC.
          Chikondi is not affiliated with, endorsed by or sponsored by Google.
        </p>
      </Section>

      <DownloadCta title="Try Chikondi" lead={`The current release is ${bundledLatest?.versionName ?? "available on the download page"}.`} />
    </PageShell>
  );
}

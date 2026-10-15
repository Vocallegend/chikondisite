import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DownloadPanel } from "@/components/DownloadPanel";
import { Section } from "@/components/Section";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useLatestRelease } from "@/lib/release";

export default function DownloadPage() {
  const state = useLatestRelease();

  return (
    <PageShell path="/download">
      <PageHero
        title="Download Chikondi for Android"
        lead="The official Android app, published here and nowhere else. Version and file size are listed so you can confirm exactly what you are installing."
      />

      <Section>
        <DownloadPanel state={state} />
      </Section>

      <Section
        eyebrow="Installing"
        title="What happens when you tap install"
        lead="A short, honest description of the one screen that surprises people."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              title: "Android asks you to confirm",
              body: "Because the app did not come from an app store, Android asks whether you want to install it. That is expected for any direct download.",
            },
            {
              title: "Your browser may ask for permission",
              body: "The first time, your browser asks to allow installs from this source. That permission applies to the browser, not to Chikondi.",
            },
            {
              title: "Never disable Play Protect",
              body: "Play Protect is your phone's malware scanning. If it flags a file, do not turn the protection off to get past it — contact us instead.",
            },
            {
              title: "Updates install over the app",
              body: "Downloading a newer version and installing it over the old one keeps your account, matches and conversations.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <div className="h-full rounded-2xl border border-white/10 bg-ink-900/40 p-6">
                <CheckCircle2 className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Before you install" title="Requirements">
        <div className="grid gap-5 sm:grid-cols-3">
          <Requirement title="Operating system" detail="Android 7.0 (Nougat) or newer" />
          <Requirement title="Connection" detail="A data or Wi-Fi connection for the download" />
          <Requirement title="Storage" detail="Roughly 20 MB free to install and open" />
        </div>
      </Section>

      <Section tone="muted">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/60 p-6">
          <ShieldCheck className="h-5 w-5 text-brand-300" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink-300">
            Chikondi is distributed as a direct APK from this website and is not published on Google
            Play. The download above is the only official source.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}

function Requirement({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">{detail}</p>
    </div>
  );
}

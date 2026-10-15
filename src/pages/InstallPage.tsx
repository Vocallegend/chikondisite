import { AlertTriangle, Download, ShieldAlert, Smartphone } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { ButtonLink } from "@/components/Button";
import { DownloadCta } from "@/components/DownloadCta";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { site } from "@/data/site";
import { bundledLatest } from "@/lib/release";

const apkName = bundledLatest?.fileName ?? "chikondi.apk";

const steps = [
  {
    title: "Download the APK",
    body: `Open the Download page on this website, on the phone you want to install Chikondi on, and tap the download button. Wait for ${apkName} to finish downloading — it is around 8 MB, so it takes a moment on a slow connection.`,
  },
  {
    title: "Open the downloaded file",
    body: "Open it from your browser's download list, or from the Downloads folder in your phone's file manager. Tapping the file starts the install.",
  },
  {
    title: "Allow installs from this source, if Android asks",
    body: "The first time you install an app from outside an app store, Android asks whether your browser may install apps. Read the prompt, and allow it only because you chose to download from this website. This permission applies to your browser, not to Chikondi, and you can turn it back off afterwards.",
  },
  {
    title: "Follow Android's installation instructions",
    body: "Tap Install and let Android finish. If it offers you the choice to install anyway after a warning, and you are confident you downloaded the file here, you may continue.",
  },
  {
    title: "Open Chikondi",
    body: "When it finishes, tap Open, or find Chikondi in your app drawer. Sign in or create your account and you are ready to go.",
  },
];

const troubleshooting = [
  {
    id: "interrupted",
    question: "The download stopped part-way, or the file will not open",
    answer:
      "A partial download will not install. Delete the file and download it again on a stable connection, ideally Wi-Fi. If it repeatedly fails, try a different browser, and make sure you have free storage first.",
  },
  {
    id: "cannot-open",
    question: "I tapped the APK and nothing happened",
    answer:
      "Some phones' file managers do not open APK files directly. Open the file from the browser's own download list instead, or use your phone's Settings → Apps → your file manager → Open supported links. If it still will not open, the download is probably incomplete — download it again.",
  },
  {
    id: "blocked",
    question: "Android blocked the install",
    answer:
      "Read the message carefully. If it is the normal confirmation for apps from outside an app store, you can choose to continue. If it is a malware or security warning, stop. Do not disable Play Protect to get past it. Close the warning and contact us through the Contact page with your phone model and Android version.",
  },
  {
    id: "not-installed",
    question: "\u201cApp not installed\u201d appears at the end",
    answer:
      "This usually means the download was incomplete, the file is corrupt, or an incompatible version is already installed. Delete the file, download it again, and check the SHA-256 against the checksum on the Download page first. If a very old copy of Chikondi is already on the phone, see the version conflict item below.",
  },
  {
    id: "storage",
    question: "There is not enough space",
    answer:
      "The APK is around 8 MB, but Android needs more free space than that to unpack and install it — leave roughly 50 MB free. Clear some space and try again.",
  },
  {
    id: "conflict",
    question: "An existing version conflicts with this one",
    answer:
      "Android only replaces an installed app when the new APK is signed with the same certificate. If you have an old build from a different source, Android will refuse and say the app is not installed. Uninstalling the old copy clears that conflict, but it also clears local data such as your saved session — see the warning below before you do that.",
  },
  {
    id: "update-fails",
    question: "Updating the app fails",
    answer:
      "Install the newer APK over the one you already have; do not uninstall first. Your account, matches and conversations live on Chikondi's servers, so an update never touches them. If Android still refuses, the installed copy was signed differently — resolve that before uninstalling anything.",
  },
];

export default function InstallPage() {
  return (
    <PageShell path="/install">
      <PageHero
        title="How to install Chikondi on Android"
        lead="Installing an app from outside an app store is normal on Android, but it involves one extra confirmation. Here is the whole process, and what to do if your phone pushes back."
        actions={
          <>
            <ButtonLink to="/download" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Go to the download page
            </ButtonLink>
            <ButtonLink to="/releases" variant="secondary" size="lg">
              Check the current version
            </ButtonLink>
          </>
        }
      />

      <Section eyebrow="Step by step" title="Installing the official APK">
        <ol className="grid gap-5 lg:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="h-full">
              <Reveal className="h-full" delay={(index % 2) * 0.04}>
                <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-ink-900/40 p-6">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">{step.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-300">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Notice tone="info" title="Never turn off Play Protect">
            Android may warn you that it has not seen an app distributed outside the Play Store
            before. That is a reputation note about a new package, not a virus detection. Follow the
            steps above, and never disable Play Protect — or any other security feature — in order
            to install something.
          </Notice>
          <Notice tone="warning" title="If Android blocks the install outright">
            Do not try to force it. Close the warning, remove the file, and contact us through the{" "}
            <a href="/contact" className="font-semibold text-brand-300 underline underline-offset-2">
              Contact page
            </a>{" "}
            with your phone model and Android version. We would rather help than have you weaken your
            phone's security.
          </Notice>
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Before you install"
        title="What you need"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: "A compatible phone",
              body: `Android ${site.android.minVersion} (API ${site.android.minApi}) or newer. Older versions cannot install the app.`,
            },
            {
              icon: ShieldAlert,
              title: "A trusted source",
              body: "Only ever install an APK you downloaded from this website. A file forwarded to you on WhatsApp or found in a group is not something we can vouch for.",
            },
            {
              icon: AlertTriangle,
              title: "Enough space",
              body: "The download is small, but leave some free storage for Android to unpack and install it.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-950/60 p-6">
              <item.icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Troubleshooting"
        title="If something goes wrong"
        lead="The problems people actually hit when installing a direct APK, and what resolves each one."
      >
        <Accordion
          className="max-w-3xl"
          items={troubleshooting.map((item) => ({
            id: item.id,
            question: item.question,
            children: <p>{item.answer}</p>,
          }))}
        />

        <div className="mt-8 max-w-3xl">
          <Notice tone="danger" title="Before you uninstall an existing copy">
            Uninstalling Chikondi removes the app from your phone. Your account, matches and
            conversations are stored on Chikondi's servers and are not deleted, but local data such
            as your saved session is cleared, and you will sign in again after reinstalling. Do not
            uninstall anything until you understand why the update is failing.
          </Notice>
        </div>
      </Section>

      <DownloadCta
        title="Ready to install?"
        lead="The download page shows the current version, its size and the SHA-256 you can check after downloading."
      />
    </PageShell>
  );
}

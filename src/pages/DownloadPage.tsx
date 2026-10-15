import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { DownloadPanel } from "@/components/DownloadPanel";
import { Notice } from "@/components/Notice";
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
        lead="The official Android app, published here and nowhere else. Version, file size and checksum are listed so you can confirm exactly what you are installing."
      />

      <Section>
        <DownloadPanel state={state} />
      </Section>

      <Section
        tone="muted"
        eyebrow="Integrity"
        title="Check the file before you install it"
        lead="A checksum is a fingerprint of a file. If the checksum of your download matches the one above, the file is exactly the release we published."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <KeyRound className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Check it on a computer
            </h3>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-300">
              <li>1. Copy the SHA-256 from the download panel above.</li>
              <li>2. Open a terminal in the folder that holds the downloaded APK.</li>
              <li>3. Run the command for your system:</li>
            </ol>
            <div className="mt-4 space-y-3">
              <CodeBlock label="Windows (Command Prompt)" command="certutil -hashfile chikondi-1.0.1.apk SHA256" />
              <CodeBlock label="macOS or Linux" command="sha256sum chikondi-1.0.1.apk" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Compare the result, ignoring spaces and letter case, with the checksum published here.
              If they match, the file is exactly what we published.
            </p>
          </div>

          <div className="space-y-5">
            <Notice tone="danger" title="If the checksum does not match">
              Do not install the file. Delete it and download again from this website. If it still
              does not match, contact us before installing anything. A mismatch means the file was
              altered after publication.
            </Notice>
            <Notice tone="info" title="Every release is signed the same way">
              All Chikondi releases are signed with the same certificate, so updates install over
              each other cleanly. That identity has not changed between versions.
            </Notice>
            <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-6">
              <h3 className="text-base font-semibold text-white">Why the checksum matters</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                Installing an app outside an app store is safe only if you know where the file came
                from. The checksum is how you check that the file in your downloads folder is the
                one we published, and not a modified copy that reached you through a forwarded
                link.
              </p>
            </div>
          </div>
        </div>
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

      {state.live && state.downloadAvailable === false && (
        <Section
          tone="muted"
          eyebrow="For the operator"
          title="The download location is not configured"
          lead="The site is working; it simply has no published APK to point at yet. Here is exactly what to set."
        >
          <div className="max-w-3xl space-y-4">
            <Notice tone="warning" title="The release is published, the link is not">
              The manifest already describes the current release truthfully. What is missing is the
              location of the file, which lives outside this repository on purpose — the APK is
              never committed to git.
            </Notice>
            <ol className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/60 p-6 text-sm leading-relaxed text-ink-300">
              <li>
                <strong className="text-white">1. Upload the APK</strong> to external storage: a
                GitHub Release, an S3-compatible bucket, or a Supabase Storage bucket. Do not commit
                it to git.
              </li>
              <li>
                <strong className="text-white">2. Set the environment variable</strong>{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
                  RELEASE_DOWNLOAD_URL
                </code>{" "}
                in the Vercel project to that file's URL, then redeploy.
              </li>
              <li>
                <strong className="text-white">3. Verify</strong> the download panel on this page:
                the button becomes active as soon as the deployment picks the variable up.
              </li>
            </ol>
          </div>
        </Section>
      )}

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

function CodeBlock({ label, command }: { label: string; command: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</p>
      <code className="mt-2 block font-mono text-xs break-all text-ink-200">{command}</code>
    </div>
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

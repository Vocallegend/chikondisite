import { Download, FileArchive, History } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { DownloadCta } from "@/components/DownloadCta";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { site } from "@/data/site";
import {
  bundledReleases,
  formatBytes,
  formatDate,
  STABLE_DOWNLOAD_PATH,
} from "@/lib/release";

/**
 * The release history.
 *
 * Every entry here comes from src/data/release.json, which is generated from the
 * real APK (versionCode, versionName, size and SHA-256) — nothing is typed in by
 * hand and nothing is estimated. When the manifest is empty the page says so
 * instead of showing an empty list.
 */
export default function ReleasesPage() {
  if (bundledReleases.length === 0) {
    return (
      <PageShell path="/releases">
        <PageHero
          title="Release notes"
          lead="Version history for the Chikondi Android app."
        />
        <Section>
          <div className="max-w-2xl">
            <Notice tone="warning" title="No published release is listed yet">
              The release manifest does not currently contain a published release. When a release
              is published, its version, date and size appear here automatically. If you
              expected to see one, contact us through the{" "}
              <a href="/contact" className="font-semibold text-brand-300 underline underline-offset-2">
                Contact page
              </a>
              .
            </Notice>
          </div>
        </Section>
        <DownloadCta />
      </PageShell>
    );
  }

  const [latest, ...older] = bundledReleases;

  return (
    <PageShell path="/releases">
      <PageHero
        title="Release notes"
        lead="Every published Chikondi build, with the exact version number, release date and file size taken from the APK itself."
        actions={
          <ButtonLink to="/download" size="lg">
            <Download className="h-5 w-5" aria-hidden="true" />
            Download the latest version
          </ButtonLink>
        }
      />

      <Section eyebrow="Current release" title={`Chikondi ${latest.versionName}`}>
        <article className="overflow-hidden rounded-3xl border border-white/12 bg-ink-900/60">
          <div className="border-b border-white/10 bg-gradient-to-br from-brand-600/25 via-transparent to-transparent p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink-100 uppercase">
                Latest published
              </span>
              <span className="rounded-full bg-brand-600/25 px-3 py-1 text-xs font-semibold text-brand-100">
                Version {latest.versionName}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-ink-200">
                Code {latest.versionCode}
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-300">
              Released {formatDate(latest.releaseDate)} · {formatBytes(latest.fileSize)} ·{" "}
              {site.android.format}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink to={STABLE_DOWNLOAD_PATH} size="lg" external>
                <Download className="h-5 w-5" aria-hidden="true" />
                Download {latest.fileName}
              </ButtonLink>
              <ButtonLink to="/install" variant="secondary" size="lg">
                Installation guide
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-px border-b border-white/10 bg-white/10 sm:grid-cols-2">
            <Detail term="Minimum Android" detail={`Android ${latest.minimumAndroidVersion}`} />
            <Detail term="File name" detail={latest.fileName} mono />
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-base font-semibold text-white">What changed in {latest.versionName}</h2>
            {latest.releaseNotes.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {latest.releaseNotes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm leading-relaxed text-ink-300">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                Release notes are not available for this version.
              </p>
            )}
            {latest.builtAt && (
              <p className="mt-4 text-xs text-ink-600">
                Built {formatDate(latest.builtAt)}
              </p>
            )}
          </div>
        </article>
      </Section>

      <Section
        tone="muted"
        eyebrow="History"
        title="Earlier releases"
        lead="Older builds are kept on record so a specific version can be identified. The stable download link always serves the latest published release."
      >
        {older.length > 0 ? (
          <ul className="space-y-4">
            {older.map((release) => (
              <li
                key={release.versionName}
                className="rounded-2xl border border-white/10 bg-ink-950/60 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-ink-100">
                      Version {release.versionName}
                    </span>
                    <span className="text-xs text-ink-500">
                      code {release.versionCode} · released {formatDate(release.releaseDate)} ·{" "}
                      {formatBytes(release.fileSize)}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-ink-400">
                    Superseded
                  </span>
                </div>
                {release.releaseNotes.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {release.releaseNotes.map((note) => (
                      <li key={note} className="flex gap-3 text-sm leading-relaxed text-ink-400">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-600"
                        />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-950/60 p-6 text-sm leading-relaxed text-ink-300">
            <History className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
            <p>
              This is the first published release recorded on this website, so there is no earlier
              version to list yet.
            </p>
          </div>
        )}
      </Section>

      <Section eyebrow="For other software" title="Machine-readable release metadata">
        <div className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-ink-300">
            The same record shown above is published at{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
              /api/releases/latest
            </code>{" "}
            as JSON, with the version, date, size and download availability. It is read-only and
            contains no credentials.
          </p>
          <ButtonLink to="/api/releases/latest" variant="secondary" external className="shrink-0">
            <FileArchive className="h-4 w-4" aria-hidden="true" />
            View the JSON
          </ButtonLink>
        </div>
      </Section>

      <DownloadCta title="Download the latest release" />
    </PageShell>
  );
}

function Detail({ term, detail, mono }: { term: string; detail: string; mono?: boolean }) {
  return (
    <div className="bg-ink-950/40 p-5">
      <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{term}</dt>
      <dd
        className={["mt-1.5 text-sm text-ink-100", mono ? "font-mono break-all" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {detail}
      </dd>
    </div>
  );
}

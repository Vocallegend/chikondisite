import { Download } from "lucide-react";
import { Button, ButtonLink } from "./Button";
import { Notice } from "./Notice";
import { formatBytes, formatDate, type LatestReleaseState } from "@/lib/release";
import { site } from "@/data/site";

function Detail({ term, detail, mono }: { term: string; detail: string; mono?: boolean }) {
  return (
    <div className="bg-ink-950/40 p-5">
      <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{term}</dt>
      <dd
        className={[
          "mt-1.5 text-sm text-ink-100",
          mono ? "font-mono break-all" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {detail}
      </dd>
    </div>
  );
}

export function DownloadPanel({ state }: { state: LatestReleaseState }) {
  const { release, downloadAvailable, stableDownloadPath, live } = state;

  if (!release) {
    return (
      <div className="rounded-3xl border border-white/10 bg-ink-900/50 p-6 sm:p-8">
        <Notice tone="warning" title="No published release is available">
          The release manifest does not currently mark a release as published. Check the Release
          Notes page, or contact us if you believe this is wrong.
        </Notice>
      </div>
    );
  }

  const blocked = live && downloadAvailable === false;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/12 bg-ink-900/60">
      <div className="border-b border-white/10 bg-gradient-to-br from-brand-600/25 via-transparent to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink-100 uppercase">
            Official build
          </span>
          <span className="rounded-full bg-brand-600/25 px-3 py-1 text-xs font-semibold text-brand-100">
            Version {release.versionName}
          </span>
          {!live && <span className="text-xs text-ink-500">bundled release record</span>}
        </div>

        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Download Chikondi for Android
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-300">
          {site.android.format} · Android {release.minimumAndroidVersion} and above ·{" "}
          {formatBytes(release.fileSize)}. Installs directly on your phone; no app store account
          needed.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {blocked ? (
            <Button disabled aria-disabled="true" size="lg">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download unavailable
            </Button>
          ) : (
            <ButtonLink to={stableDownloadPath} size="lg" external>
              <Download className="h-5 w-5" aria-hidden="true" />
              Download ({formatBytes(release.fileSize)})
            </ButtonLink>
          )}
          <ButtonLink to="/install" variant="secondary" size="lg">
            Installation guide
          </ButtonLink>
        </div>

        {blocked && (
          <Notice tone="warning" className="mt-6" title="The APK has not been uploaded yet">
            This deployment is not linked to an APK yet, so the button cannot reach a file. The
            release record itself exists — version {release.versionName},{" "}
            {formatBytes(release.fileSize)}, released {formatDate(release.releaseDate)}. Upload the
            build with{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
              npm run release:publish -- --apk &lt;path-to.apk&gt;
            </code>{" "}
            and redeploy, or point{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
              RELEASE_DOWNLOAD_URL
            </code>{" "}
            at an external host.
          </Notice>
        )}
      </div>

      <dl className="grid gap-px border-b border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        <Detail term="Version" detail={`${release.versionName} · build ${release.versionCode}`} />
        <Detail term="Released" detail={formatDate(release.releaseDate)} />
        <Detail term="File size" detail={formatBytes(release.fileSize)} />
        <Detail
          term="Minimum Android"
          detail={`Android ${release.minimumAndroidVersion} · API ${site.android.minApi}`}
        />
        <Detail term="File name" detail={release.fileName} mono />
      </dl>
    </div>
  );
}

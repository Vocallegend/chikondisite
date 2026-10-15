import { useState } from "react";
import { Check, Copy, Download, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "./Button";
import { Notice } from "./Notice";
import { formatBytes, formatDate, type LatestReleaseState } from "@/lib/release";
import { site } from "@/data/site";

/** Copy a SHA-256 to the clipboard, with a visible, honest result. */
export function CopyChecksum({ value, label = "Copy" }: { value: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Older Android browsers; still user-initiated.
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-ink-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
    >
      {state === "copied" ? (
        <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : label}
    </button>
  );
}

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
          <Notice tone="warning" className="mt-6" title="The download location is not configured">
            This deployment has no official download location set, so the button cannot reach a
            file. The release itself is published — version {release.versionName},{" "}
            {formatBytes(release.fileSize)}, released {formatDate(release.releaseDate)}. Set{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
              RELEASE_DOWNLOAD_URL
            </code>{" "}
            to the published APK in the deployment environment and redeploy.
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
        <Detail term="Package" detail={site.packageId} mono />
        <Detail term="File name" detail={release.fileName} mono />
      </dl>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-brand-300" aria-hidden="true" />
            SHA-256 checksum
          </h3>
          <CopyChecksum value={release.sha256} label="Copy SHA-256" />
        </div>
        <p className="mt-3 font-mono text-xs leading-relaxed break-all text-ink-400">
          {release.sha256}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          Compare this with the checksum of the file you downloaded. If they differ, do not install
          the file — delete it and contact us through the Contact page.
        </p>
      </div>
    </div>
  );
}

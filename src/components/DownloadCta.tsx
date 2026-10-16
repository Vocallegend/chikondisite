import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ButtonLink } from "./Button";
import { Reveal } from "./Reveal";
import { bundledLatest, formatBytes, formatDate } from "@/lib/release";

/**
 * The closing band on most pages.
 *
 * The version, size and date come from the release manifest, so the call to
 * action says something true about the build a visitor is about to install.
 * When the manifest has no published release, the line is omitted rather than
 * filled with a placeholder.
 */
export function DownloadCta({
  title = "Get Chikondi on your Android phone",
  lead,
  secondary = true,
}: {
  title?: string;
  lead?: string;
  secondary?: boolean;
}) {
  const facts = bundledLatest
    ? `Version ${bundledLatest.versionName} · ${formatBytes(bundledLatest.fileSize)} · released ${formatDate(
        bundledLatest.releaseDate,
      )}`
    : null;

  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const glowY = useTransform(scrollYProgress, [0, 1], ["-18%", "10%"]);

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-ink-900/40">
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: glowY }}
        className="pointer-events-none absolute -top-32 left-1/2 h-[26rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl"
      />
      <div className="container-page relative py-16 text-center sm:py-20">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-300">
            {lead ??
              "Download the official Chikondi Android app directly from this website. Free, and no app store account required."}
          </p>
          {facts && (
            <p className="mt-3 text-xs font-medium tracking-wide text-ink-500 uppercase">{facts}</p>
          )}
        </Reveal>
        <Reveal delay={0.12} variant="scale" distance={10}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/download" size="lg">
              Go to the download page
            </ButtonLink>
            {secondary && (
              <ButtonLink to="/install" variant="secondary" size="lg">
                How to install
              </ButtonLink>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

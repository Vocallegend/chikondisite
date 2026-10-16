import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Decorative brand glow used behind hero and call-to-action sections. */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute -z-10 rounded-full blur-3xl motion-safe:animate-[glow_9s_ease-in-out_infinite]",
        className ?? "",
      ].join(" ")}
      style={{
        background:
          "radial-gradient(closest-side, oklch(0.55 0.22 27 / 0.55), transparent 70%)",
      }}
    />
  );
}

/** The opening block of an interior page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();

  // The two blobs drift against the scroll, which is what stops the top of
  // every interior page feeling like a still image.
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 700], [0, 130]);
  const glowStyle = reduced ? undefined : { y: glowY };

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <motion.div
        aria-hidden="true"
        style={glowStyle}
        className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-600/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        style={glowStyle}
        className="pointer-events-none absolute -bottom-52 -left-32 h-[26rem] w-[26rem] rounded-full bg-gold-500/10 blur-3xl"
      />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        {children ? (
          <motion.div
            className="max-w-3xl"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            className="max-w-3xl"
            initial={reduced ? { opacity: 1 } : "hidden"}
            animate={reduced ? { opacity: 1 } : "show"}
            variants={container}
          >
            {eyebrow && (
              <motion.p
                variants={reduced ? undefined : item}
                className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase"
              >
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={reduced ? undefined : item}
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
            >
              {title}
            </motion.h1>
            {lead && (
              <motion.p
                variants={reduced ? undefined : item}
                className="mt-5 text-lg leading-relaxed text-ink-300 sm:text-xl"
              >
                {lead}
              </motion.p>
            )}
            {actions && (
              <motion.div variants={reduced ? undefined : item} className="mt-8 flex flex-wrap gap-3">
                {actions}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

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
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-32 h-[26rem] w-[26rem] rounded-full bg-gold-500/10 blur-3xl"
      />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          {children ?? (
            <>
              {eyebrow && (
                <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                {title}
              </h1>
              {lead && <p className="mt-5 text-lg leading-relaxed text-ink-300 sm:text-xl">{lead}</p>}
              {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

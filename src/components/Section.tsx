import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * A page section with an optional eyebrow, heading and lead.
 *
 * Used by every content page so spacing, heading levels and the reading width
 * stay consistent without each page inventing its own rhythm. The header
 * arrives on scroll, which is what gives the whole site its reading rhythm
 * without every page hand-rolling it.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      className={[
        "py-16 sm:py-20 lg:py-24",
        tone === "muted" ? "bg-ink-900/40" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="container-page">
        {(eyebrow || title || lead) && (
          <Reveal>
            <header className="max-w-3xl">
              {eyebrow && (
                <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
              )}
              {lead && <p className="mt-4 text-lg leading-relaxed text-ink-300">{lead}</p>}
            </header>
          </Reveal>
        )}
        <div className={eyebrow || title || lead ? "mt-10 sm:mt-12" : ""}>{children}</div>
      </div>
    </section>
  );
}

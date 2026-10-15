import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

type Tone = "info" | "warning" | "danger" | "success";

const styles: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "border-white/12 bg-white/5 text-ink-200",
    icon: <Info className="h-5 w-5 text-brand-300" aria-hidden="true" />,
  },
  warning: {
    wrap: "border-gold-500/30 bg-gold-500/10 text-ink-100",
    icon: <AlertTriangle className="h-5 w-5 text-gold-500" aria-hidden="true" />,
  },
  danger: {
    wrap: "border-brand-500/35 bg-brand-500/10 text-ink-100",
    icon: <ShieldAlert className="h-5 w-5 text-brand-300" aria-hidden="true" />,
  },
  success: {
    wrap: "border-emerald-400/25 bg-emerald-400/10 text-ink-100",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />,
  },
};

/**
 * An inline callout. Success and failure set a live-region role so assistive
 * technology announces the outcome of an action rather than leaving the visitor
 * to discover it.
 */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon } = styles[tone];
  const role = tone === "success" ? "status" : tone === "danger" ? "alert" : undefined;

  return (
    <div
      role={tone === "info" ? undefined : role}
      className={["flex gap-3 rounded-2xl border px-5 py-4", styles[tone].wrap, className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold text-white">{title}</p>}
        <div className={["text-sm leading-relaxed", title ? "mt-1" : ""].join(" ")}>{children}</div>
      </div>
    </div>
  );
}

/** A plain panel used for setup instructions and other body copy blocks. */
export function CalloutBox({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["rounded-2xl border border-white/12 bg-ink-900/50 p-5 sm:p-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
      <div className={["space-y-3 text-sm leading-relaxed text-ink-300", title ? "mt-3" : ""].join(" ")}>
        {children}
      </div>
    </div>
  );
}

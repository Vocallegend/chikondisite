import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition " +
  "duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-950/40 hover:bg-brand-500 " +
    "active:bg-brand-700 focus-visible:outline-brand-400",
  secondary:
    "border border-white/15 bg-white/5 text-ink-100 hover:border-white/25 hover:bg-white/10 " +
    "focus-visible:outline-white/40",
  ghost: "text-ink-200 hover:bg-white/5 hover:text-white focus-visible:outline-white/30",
  gold: "bg-gold-500 text-ink-950 hover:bg-gold-400 focus-visible:outline-gold-500",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

type ButtonLinkProps = {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Set for links that leave the site, so they open safely in a new tab. */
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

/** A router link styled as a button. */
export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  ...rest
}: ButtonLinkProps) {
  const cls = classes(variant, size, className);
  if (external) {
    return (
      <a
        href={to}
        className={cls}
        rel="noopener noreferrer"
        {...(to.startsWith("http") ? { target: "_blank" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

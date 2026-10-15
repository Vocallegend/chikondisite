import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * A restrained scroll-in reveal.
 *
 * The whole animation budget of this site: a short fade and a small rise, once,
 * as content enters the viewport. It is skipped entirely when the visitor has
 * asked for reduced motion — the content is still there, it just arrives
 * without moving.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

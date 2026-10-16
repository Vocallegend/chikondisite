import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export type RevealVariant =
  /** The default: fade in while rising a few pixels. */
  | "up"
  /** Drop in from above — for content that sits under something it came from. */
  | "down"
  /** Enter from the side that reads first in left-to-right scripts. */
  | "left"
  | "right"
  /** Zoom up from just behind the page. */
  | "scale"
  /** Resolve out of a soft focus. Best on short headings, not long copy. */
  | "blur"
  /** Swing up out of perspective for a genuinely 3D arrival. */
  | "tilt";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function states(variant: RevealVariant, distance: number) {
  switch (variant) {
    case "down":
      return { hidden: { y: -distance }, shown: { y: 0 } };
    case "left":
      return { hidden: { x: -distance }, shown: { x: 0 } };
    case "right":
      return { hidden: { x: distance }, shown: { x: 0 } };
    case "scale":
      return { hidden: { scale: 0.94 }, shown: { scale: 1 } };
    case "blur":
      return { hidden: { filter: "blur(10px)" }, shown: { filter: "blur(0px)" } };
    case "tilt":
      return {
        hidden: { y: distance, rotateX: 16, transformPerspective: 900 },
        shown: { y: 0, rotateX: 0, transformPerspective: 900 },
      };
    case "up":
    default:
      return { hidden: { y: distance }, shown: { y: 0 } };
  }
}

/**
 * The site's scroll-in reveal.
 *
 * Content fades and moves once as it enters the viewport. The default reads as
 * a gentle rise; the other variants exist for places where direction or depth
 * carries the composition — side entrances for paired columns, `tilt` for
 * hero-scale blocks, `blur` for a heading resolving into focus.
 *
 * It is skipped entirely when the visitor has asked for reduced motion: the
 * content is still there, it just arrives without moving.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  variant = "up",
  distance = 18,
  duration = 0.6,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
  /** How far the content travels, in pixels. */
  distance?: number;
  duration?: number;
  /** Only animate the first time it enters view. */
  once?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const { hidden, shown } = states(variant, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...hidden }}
      whileInView={{ opacity: 1, ...shown }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

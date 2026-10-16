import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

const SPRING = { stiffness: 220, damping: 22, mass: 0.7 };

/**
 * Pointer-driven 3D tilt with a light that follows the cursor.
 *
 * The wrapper carries the perspective, the inner element leans on rotateX /
 * rotateY toward wherever the pointer is, and a screen-blended glare sweeps
 * across the surface so the card reads as a physical object catching light
 * rather than a rectangle changing colour.
 *
 * Touch pointers are ignored on purpose: a tilt that follows a finger during a
 * scroll gesture fights the scroll and leaves cards stuck at an angle. Phones
 * get the same dimensionality from the scroll-driven rotations elsewhere on
 * the page instead.
 *
 * Nothing happens under reduced motion — the children render as they are.
 */
export function Tilt({
  children,
  className,
  max = 8,
  hoverScale = 1.02,
  glare = true,
  radius = "rounded-2xl",
}: {
  children: ReactNode;
  className?: string;
  /** How far the surface leans toward the pointer, in degrees. */
  max?: number;
  /** How much the surface grows while the pointer is on it. */
  hoverScale?: number;
  glare?: boolean;
  /** Corner radius for the glare, so it matches whatever is being tilted. */
  radius?: string;
}) {
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);
  const scale = useSpring(useTransform(active, [0, 1], [1, hoverScale]), SPRING);
  const glareOpacity = useTransform(active, [0, 1], [0, 1]);

  const glareBackground = useTransform([px, py], (values: number[]) => {
    const x = (values[0] * 100).toFixed(1);
    const y = (values[1] * 100).toFixed(1);
    return `radial-gradient(460px circle at ${x}% ${y}%, rgba(255,255,255,0.24), transparent 62%)`;
  });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    active.set(1);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  }

  return (
    <div
      className={className}
      style={{ perspective: "1100px" }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ${radius} mix-blend-screen`}
            style={{ backgroundImage: glareBackground, opacity: glareOpacity }}
          />
        )}
      </motion.div>
    </div>
  );
}

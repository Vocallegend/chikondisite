import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Download, ShieldCheck, X } from "lucide-react";
import { primaryNav, site } from "@/data/site";
import { STABLE_DOWNLOAD_PATH } from "@/lib/release";
import { ButtonLink } from "./Button";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const PANEL_SPRING = { type: "spring" as const, stiffness: 340, damping: 34, mass: 0.9 };
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * The mobile navigation drawer.
 *
 * Opened from the toggle in the header on a screen too narrow for the desktop
 * navigation (see public/fit.js): a full-bleed layer blurs and darkens the page
 * behind it, and the panel springs in from the right with its links staggered
 * behind it.
 *
 * It behaves like a dialog, because it is one — focus moves in when it opens,
 * Tab is kept inside it, Escape closes it, the page behind it cannot scroll,
 * and focus returns to the toggle on the way out.
 */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the panel once it is on screen.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Keep Tab circulating inside the panel while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || active === panel)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const layerTransition = reduced
    ? { duration: 0.15 }
    : { duration: 0.3, ease: EASE };

  const panelTransition = reduced
    ? { duration: 0.15 }
    : PANEL_SPRING;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={layerTransition}
        >
          {/* The blurred page behind the panel. Escape and the close button
              are the accessible ways out; this is the convenient one. */}
          <div
            aria-hidden="true"
            className="site-drawer-backdrop absolute inset-0 bg-ink-950/60 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="site-drawer-panel absolute inset-y-0 right-0 flex w-[26rem] max-w-[88%] flex-col overflow-y-auto border-l border-white/12 bg-ink-950/95 shadow-[0_0_90px_rgba(0,0,0,0.7)] outline-none backdrop-blur-2xl"
            initial={reduced ? { opacity: 0 } : { x: "104%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "104%" }}
            transition={panelTransition}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand-600/12 to-transparent" />

            <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <span className="flex items-center gap-2.5">
                <img
                  src="/brand/chikondi-logo-256.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-lg"
                />
                <span className="text-base font-bold tracking-tight text-white">{site.name}</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink-100 transition hover:rotate-90 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Menu" className="relative flex-1 px-3 py-4">
              <ul className="space-y-1">
                {primaryNav.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.1 + index * 0.045,
                      duration: 0.4,
                      ease: EASE,
                    }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-ink-200 hover:bg-white/5 hover:text-white",
                        ].join(" ")
                      }
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className="h-4 w-4 -translate-x-1 text-brand-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              className="relative border-t border-white/10 px-4 py-5"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.1 + primaryNav.length * 0.045, duration: 0.4, ease: EASE }}
            >
              <div className="flex flex-col gap-2">
                <ButtonLink to="/download" size="lg" className="w-full" onClick={onClose}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Chikondi
                </ButtonLink>
                <ButtonLink
                  to={STABLE_DOWNLOAD_PATH}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  external
                >
                  Download the APK directly
                </ButtonLink>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                Adults only · Android {site.android.minVersion}+
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

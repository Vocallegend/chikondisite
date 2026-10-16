import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import { Download, Menu } from "lucide-react";
import { primaryNav, site } from "@/data/site";
import { ButtonLink } from "./Button";
import { NavDrawer } from "./NavDrawer";

const linkBase =
  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Scroll progress across the top edge of the header.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Escape closes, and the page behind must not scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // fit.js marks the document when the screen is genuinely narrow. If that
  // stops being true while the drawer is open — a desktop window zoomed out
  // and zoomed back in, say — close it, or the toggle disappears underneath
  // and the visitor is left locked out of the page.
  useEffect(() => {
    const onNarrowChange = (event: Event) => {
      const detail = (event as CustomEvent<{ narrow: boolean }>).detail;
      if (!detail.narrow) setOpen(false);
    };
    document.addEventListener("narrowchange", onNarrowChange);
    return () => document.removeEventListener("narrowchange", onNarrowChange);
  }, []);

  // Hand focus back to the toggle once the drawer has closed.
  useEffect(() => {
    if (wasOpen.current && !open) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled || open
            ? "border-b border-white/10 bg-ink-950/85 backdrop-blur-xl"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div className="site-header-inner container-page flex h-16 items-center justify-between gap-4 sm:h-18">
          <Link
            to="/"
            className="site-header-brand flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
            aria-label={`${site.name} home`}
          >
            <img
              src="/brand/chikondi-logo-256.png"
              alt=""
              width={32}
              height={32}
              className="site-header-logo h-8 w-8 rounded-lg"
            />
            <span className="site-header-name text-lg font-bold tracking-tight text-white">
              {site.name}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="site-nav-desktop hidden items-center gap-1 lg:flex"
          >
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-ink-300 hover:-translate-y-px hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink to="/download" className="site-header-cta hidden sm:inline-flex">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="site-nav-toggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink-100 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 lg:hidden"
            >
              <motion.span
                animate={{ rotate: open ? 90 : 0, scale: open ? 0.85 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="inline-flex"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </button>
          </div>
        </div>

        {/* Reading progress: empty at the top of the page, full at the bottom. */}
        <motion.div
          aria-hidden="true"
          className="site-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-gold-500"
          style={{ scaleX: progress }}
        />
      </header>

      <div id="mobile-nav">
        <NavDrawer open={open} onClose={() => setOpen(false)} />
      </div>
    </>
  );
}

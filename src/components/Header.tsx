import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Download, Menu, X } from "lucide-react";
import { primaryNav, site } from "@/data/site";
import { STABLE_DOWNLOAD_PATH } from "@/lib/release";
import { ButtonLink } from "./Button";

const linkBase =
  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on navigation.
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

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-white/10 bg-ink-950/85 backdrop-blur-xl"
          : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
          aria-label={`${site.name} home`}
        >
          <img
            src="/brand/chikondi-logo-256.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-white">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  linkBase,
                  isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink to="/download" className="hidden sm:inline-flex">
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink-100 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "rounded-xl px-4 py-3 text-base font-medium",
                    isActive ? "bg-white/10 text-white" : "text-ink-200 hover:bg-white/5",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <ButtonLink to="/download" size="lg">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Chikondi
              </ButtonLink>
              <ButtonLink to={STABLE_DOWNLOAD_PATH} variant="secondary" external>
                Download the APK directly
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

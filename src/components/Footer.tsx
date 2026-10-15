import { Link } from "react-router-dom";
import { footerColumns, legalLinks, site } from "@/data/site";
import { ButtonLink } from "./Button";

export function Footer() {
  const year = new Date().getFullYear();
  const owner = site.company.legalName || site.name;

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
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
            <p className="mt-4 text-sm leading-relaxed text-ink-400">{site.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-ink-200">
              <span aria-hidden="true">18+</span>
              <span className="sr-only">Adults only.</span>
              <span aria-hidden="true" className="text-ink-400">
                For adults aged 18 and over
              </span>
            </p>
            <div className="mt-6">
              <ButtonLink to="/download" size="md">
                Download for Android
              </ButtonLink>
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-white">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-500">
            © {year} {owner}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-ink-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-600">
          Chikondi is distributed as a direct Android download from this website and is not
          published on Google Play. Android and Google Play are trademarks of Google LLC. Chikondi
          is not affiliated with, endorsed by or sponsored by Google.
        </p>
      </div>
    </footer>
  );
}

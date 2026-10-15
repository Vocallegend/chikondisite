import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JsonLd } from "@/components/JsonLd";
import { Layout } from "@/components/Layout";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import DownloadPage from "@/pages/DownloadPage";
import FaqPage from "@/pages/FaqPage";
import FeaturesPage from "@/pages/FeaturesPage";
import HelpPage from "@/pages/HelpPage";
import HomePage from "@/pages/HomePage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import InstallPage from "@/pages/InstallPage";
import LegalDetailPage from "@/pages/LegalDetailPage";
import LegalPage from "@/pages/LegalPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ReleasesPage from "@/pages/ReleasesPage";
import SafetyPage from "@/pages/SafetyPage";

/**
 * Every route on the site.
 *
 * The three top-level legal documents get friendly URLs (/privacy, /terms,
 * /guidelines) because those are the ones people link to and expect to find;
 * the longer policies live under /legal/<slug>. Anything else falls through to
 * a real "not found" page rather than an empty screen.
 *
 * Vercel rewrites every non-asset, non-api URL to index.html (see vercel.json),
 * and scripts/prerender-meta.mjs bakes a static HTML file per route, so a deep
 * link lands on the right page whether or not JavaScript has run yet.
 */
export function App() {
  return (
    <BrowserRouter>
      <JsonLd />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/download" element={<DownloadPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/releases" element={<ReleasesPage />} />

          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/privacy" element={<LegalPage page="/privacy" />} />
          <Route path="/terms" element={<LegalPage page="/terms" />} />
          <Route path="/guidelines" element={<LegalPage page="/guidelines" />} />
          <Route path="/legal/:slug" element={<LegalDetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

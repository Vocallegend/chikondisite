/**
 * Structured data (schema.org) for the site.
 *
 * Only facts the build actually knows are emitted: the app name, the Android
 * platform, the current version and file size from the release manifest, and the
 * download URL when one is configured. There is deliberately no aggregateRating
 * and no review — inventing either would be the kind of markup search engines
 * penalise, and this product has no such data.
 */
import { bundledLatest, formatBytes } from "@/lib/release";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { site } from "@/data/site";

export function JsonLd() {
  const base = siteUrl();
  if (!base) return null;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: `${base}/`,
      name: site.name,
      description: site.description,
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: site.name,
      url: `${base}/`,
      logo: absoluteUrl("/brand/chikondi-logo-256.png"),
    },
  ];

  if (bundledLatest) {
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${base}/#app`,
      name: site.name,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: `Android ${site.android.minVersion}+`,
      softwareVersion: bundledLatest.versionName,
      softwareHelp: absoluteUrl("/help"),
      fileSize: formatBytes(bundledLatest.fileSize),
      downloadUrl: absoluteUrl("/downloads/chikondi.apk"),
      installUrl: absoluteUrl("/install"),
      publisher: { "@id": `${base}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "ZMW",
        description: "Chikondi is free to download.",
      },
    });
  }

  return (
    <script
      type="application/ld+json"
      // Structured data is a data block, not executable script; it is not
      // subject to script-src and contains only build-time constants.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

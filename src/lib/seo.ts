/**
 * Per-route metadata.
 *
 * `scripts/prerender-meta.mjs` bakes the same values into a static HTML file per
 * route so crawlers and social scrapers see real titles without running
 * JavaScript. This module is the client half: it keeps the document head correct
 * during client-side navigation, so a member who moves from the homepage to the
 * Download page does not leave the homepage title in their history or their
 * shared link.
 */
import { useEffect } from "react";
import seoRoutes from "@/data/seo-routes.json";
import { absoluteUrl } from "./site-url";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  priority?: string;
};

export const routeMeta: RouteMeta[] = (seoRoutes.routes as RouteMeta[]) ?? [];

export function metaForPath(path: string): RouteMeta | undefined {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return routeMeta.find((route) => route.path === clean);
}

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Apply a route's metadata to the live document.
 *
 * `canonicalPath` lets a dynamic page (for example a legal document) declare the
 * URL it should be indexed under without inventing a second route entry.
 */
export function useSeo(meta: RouteMeta | undefined, canonicalPath?: string) {
  useEffect(() => {
    if (!meta) return;
    const path = canonicalPath ?? meta.path;
    const url = absoluteUrl(path);
    const image = absoluteUrl("/brand/og-image.png");

    document.title = meta.title;
    setMeta('meta[name="description"]', "name", "description", meta.description);
    setMeta('meta[property="og:title"]', "property", "og:title", meta.title);
    setMeta('meta[property="og:description"]', "property", "og:description", meta.description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [meta, canonicalPath]);
}

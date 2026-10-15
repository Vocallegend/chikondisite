import type { ReactNode } from "react";
import { metaForPath, useSeo } from "@/lib/seo";

/**
 * Wraps a page so it declares its own metadata.
 *
 * `canonicalPath` is for pages that are served from more than one URL (a legal
 * document reached by slug, for example) so the canonical stays stable.
 */
export function PageShell({
  path,
  canonicalPath,
  children,
}: {
  path: string;
  canonicalPath?: string;
  children: ReactNode;
}) {
  useSeo(metaForPath(path), canonicalPath);
  return <>{children}</>;
}

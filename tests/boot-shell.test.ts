import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The boot shell is the part of the site that works without JavaScript.
 *
 * These pin the properties that make the difference between a blank screen
 * and a usable page when the bundle is slow, blocked or missing: no
 * render-blocking scripts in <head>, a static fallback carrying the download
 * link, and a watchdog that can tell whether the app ever started.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const html = readFileSync(`${root}index.html`, "utf8");
/** Comments explain the shell; they are not part of what the browser runs. */
const markup = html.replace(/<!--[\s\S]*?-->/g, "");

describe("index.html boot shell", () => {
  it("never blocks parsing on a script", () => {
    // A classic <script> in <head> stops the parser until it downloads, so a
    // stalled connection would leave the whole body unparsed — an indefinitely
    // blank page. Every script must therefore be deferred.
    const scripts = [...markup.matchAll(/<script([^>]*)>/g)].map(([, attrs]) => attrs);
    expect(scripts.length).toBeGreaterThan(0);
    for (const attrs of scripts) {
      const isModule = /type="module"/.test(attrs);
      const isDeferred = /\bdefer\b/.test(attrs);
      expect(isModule || isDeferred).toBe(true);
    }
  });

  it("ships the fit and watchdog scripts as deferred, same-origin files", () => {
    expect(html).toContain('<script defer src="/fit.js"></script>');
    expect(html).toContain('<script defer src="/boot.js"></script>');
  });

  it("renders a static fallback with the real download link", () => {
    expect(html).toContain('id="boot-fallback"');
    expect(html).toContain('href="/downloads/chikondi.apk"');
    // Inline styling is what lets the fallback paint before (or without) the
    // compiled stylesheet.
    expect(html).toMatch(/id="boot-fallback"[^>]*style="/);
  });

  it("gives the watchdog a note to reveal and a signal to watch", () => {
    expect(html).toContain('id="boot-fallback-note"');
    expect(html).toContain('id="boot-fallback-message"');
    expect(html).toContain('href="/"');
  });

  it("keeps the noscript path to the APK", () => {
    expect(html).toContain("<noscript>");
    expect(html).toContain('href="/downloads/chikondi.apk"');
  });
});

describe("public/boot.js", () => {
  const bootPath = `${root}public/boot.js`;

  it("exists and is copied into the build", () => {
    expect(existsSync(bootPath)).toBe(true);
  });

  it("watches the attribute App sets after the first successful commit", () => {
    const boot = readFileSync(bootPath, "utf8");
    expect(boot).toContain("data-chikondi-boot");
    expect(boot).toContain("__chikondiDiagnosticsInstalled");
  });
});

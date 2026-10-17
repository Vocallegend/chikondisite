/**
 * Boot watchdog and production diagnostics for the Chikondi website.
 *
 * Loaded (deferred) from index.html, so it runs before the app bundle and is
 * alive even when the app bundle never arrives at all — which is exactly when
 * it is needed. It has three jobs:
 *
 *   1. Collect diagnostics that are safe to keep in production: uncaught
 *      JavaScript errors, unhandled promise rejections, and failed static
 *      assets (script, stylesheet, image). Nothing here records personal data,
 *      tokens or cookies; messages are truncated and the buffer is bounded.
 *
 *   2. Watch the boot. src/App.tsx sets <html data-chikondi-boot="ready">
 *      after the first successful React commit. If that has not happened
 *      within BOOT_TIMEOUT_MS — the bundle 404'd, a request stalled, or the
 *      app threw while starting — the note inside #boot-fallback is revealed
 *      so the visitor gets an explanation and a reload link instead of a page
 *      that looks finished but is not.
 *
 *   3. Fail fast on the fatal case: a stylesheet or script that never loads
 *      (stale cached HTML pointing at a hashed file from an older deploy, a
 *      stalled connection) reveals that same note immediately, because waiting
 *      out the watchdog cannot fix those.
 *
 * The fallback itself is plain HTML in index.html; this script only annotates
 * it. If boot.js itself fails to load, the fallback still renders, the app
 * still boots, and the only loss is the watchdog and these logs.
 */
(function () {
  "use strict";

  var BOOT_TIMEOUT_MS = 12000;
  var MAX_ENTRIES = 50;

  /** Bounded, in-memory diagnostic buffer; exposed for support and tests. */
  var entries = [];
  window.__chikondiDiagnostics = entries;
  // Lets src/lib/diagnostics.ts know the listeners are already attached.
  window.__chikondiDiagnosticsInstalled = true;

  function truncate(value, limit) {
    var text = String(value == null ? "" : value);
    return text.length > limit ? text.slice(0, limit) + "…" : text;
  }

  function record(kind, message, source) {
    entries.push({
      kind: kind,
      message: truncate(message, 400),
      source: truncate(source || "", 200),
      at: new Date().toISOString(),
    });
    if (entries.length > MAX_ENTRIES) entries.shift();
    try {
      console.error("[chikondi]", kind + ":", truncate(message, 400), source || "");
    } catch (ignored) {
      /* a broken console must not break the page */
    }
  }

  function booted() {
    return document.documentElement.getAttribute("data-chikondi-boot") === "ready";
  }

  function reveal(message) {
    if (booted()) return;
    var note = document.getElementById("boot-fallback-note");
    var text = document.getElementById("boot-fallback-message");
    if (!note || !text || !note.hidden) return;
    text.textContent = message + " ";
    note.hidden = false;
  }

  window.addEventListener(
    "error",
    function (event) {
      var target = event.target;
      // Resource failures report the element; script errors report the window.
      if (target && target.nodeType === 1) {
        var name = target.tagName || "asset";
        var url = target.src || target.href || "";
        record("asset", name + " failed to load" + (url ? ": " + url : ""), url);
        // Scripts and stylesheets are load-bearing; images and icons are not.
        if (name === "SCRIPT" || name === "LINK") {
          reveal(
            "Part of the site could not be downloaded, so the interface could not start. " +
              "This usually clears up on the next load.",
          );
        }
        return;
      }
      record(
        "error",
        event.message || "Uncaught error",
        (event.filename || "") + ":" + (event.lineno || ""),
      );
      reveal(
        "The site's interface hit a problem while starting. The APK download above still works.",
      );
    },
    true,
  );

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    record(
      "unhandledrejection",
      (reason && (reason.message || String(reason))) || "Promise rejected",
      reason && reason.stack ? truncate(reason.stack, 300) : "",
    );
  });

  window.setTimeout(function () {
    if (booted()) return;
    record(
      "boot-timeout",
      "The application did not start within " +
        BOOT_TIMEOUT_MS +
        "ms. Check the asset entries above.",
    );
    reveal(
      "The site's interface is taking too long to load, which can happen on a slow or " +
        "interrupted connection.",
    );
  }, BOOT_TIMEOUT_MS);
})();

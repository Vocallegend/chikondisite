import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installDiagnostics, reportDiagnostic } from "./lib/diagnostics";
import "./styles.css";

/**
 * Application entry point.
 *
 * Two things outside this file keep the page usable when something here fails:
 *
 *   - index.html ships a static #boot-fallback (removed by App once React has
 *     actually committed) and a <noscript> block, and both link straight to
 *     /downloads/chikondi.apk. A visitor without JavaScript — or with a
 *     bundle that never arrives — still reaches the real download.
 *   - public/boot.js watches whether this file ever runs at all and tells the
 *     visitor when it does not.
 *
 * installDiagnostics() attaches the global error listeners if boot.js has not
 * already, so an exception during the first render is recorded as well as
 * printed.
 */
installDiagnostics();

const container = document.getElementById("root");

if (!container) {
  reportDiagnostic("boot", "Chikondi website: #root container is missing from index.html");
  throw new Error("Chikondi website: #root container is missing from index.html");
}

try {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  reportDiagnostic(
    "boot",
    `The application failed to start: ${error instanceof Error ? error.message : String(error)}`,
  );
  // The static fallback in index.html is still on screen, so rethrow only to
  // leave a clear trace — the visitor already has a working page.
  throw error;
}

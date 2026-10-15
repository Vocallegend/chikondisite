import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

/**
 * Application entry point.
 *
 * `index.html` ships a `<noscript>` block that still links straight to
 * /downloads/chikondi.apk, so a visitor without JavaScript can still reach the
 * real download even though the interface itself is rendered here.
 */
const container = document.getElementById("root");

if (!container) {
  throw new Error("Chikondi website: #root container is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

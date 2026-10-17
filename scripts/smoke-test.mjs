/**
 * Boot smoke test — run against the real production build.
 *
 *   npm run build
 *   node scripts/smoke-test.mjs
 *
 * It serves dist/ with `vite preview`, drives it with headless Chrome, and
 * checks the three things that decide whether a visitor on a bad connection
 * sees the site or a blank screen:
 *
 *   1. a normal load boots the app, removes the static fallback and records no
 *      console errors;
 *   2. when the app bundle 404s (the classic stale-cached-HTML case) the page
 *      still shows Chikondi branding and a working APK link, and the watchdog
 *      explains what happened;
 *   3. when a script in <head> never finishes downloading, the body is still
 *      parsed and the fallback is on screen — the failure mode that used to
 *      leave the page blank forever.
 *
 * puppeteer-core and Chrome are development-only. If either is missing the
 * script exits successfully with a SKIP notice rather than failing a build.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const website = resolve(here, "..");
const PORT = Number(process.env.SMOKE_PORT || 4178);
// `vite preview` listens on localhost (which resolves to ::1 on Windows), so
// the checks must use the same name rather than the 127.0.0.1 literal.
const BASE = `http://localhost:${PORT}`;
const WATCHDOG_WAIT_MS = 14_000;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

function findChrome() {
  return CHROME_CANDIDATES.find((path) => existsSync(path)) ?? null;
}

async function loadPuppeteer() {
  try {
    return (await import("puppeteer-core")).default;
  } catch {
    return null;
  }
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`preview server did not start on ${BASE}`);
}

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const puppeteer = await loadPuppeteer();
  if (!puppeteer) {
    console.log("SKIP  puppeteer-core is not installed; run `npm i -D puppeteer-core` to enable.");
    return;
  }
  const executablePath = findChrome();
  if (!executablePath) {
    console.log("SKIP  no Chrome or Edge binary found; set CHROME_PATH to enable.");
    return;
  }

  // Spawn the Vite CLI with Node directly: launching npm on Windows needs a
  // shell, and the shell form is deprecated for argument passing.
  const viteBin = resolve(website, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(
    process.execPath,
    [viteBin, "preview", "--port", String(PORT), "--strictPort"],
    { cwd: website, stdio: "ignore" },
  );

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    await waitForServer();

    // 1. Normal load -------------------------------------------------------
    {
      const page = await browser.newPage();
      const pageErrors = [];
      const failedResponses = [];
      page.on("pageerror", (error) => pageErrors.push(String(error)));
      page.on("response", (response) => {
        if (response.status() >= 400)
          failedResponses.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60_000 });
      await page.waitForSelector("main#main", { timeout: 20_000 });

      const state = await page.evaluate(() => ({
        boot: document.documentElement.getAttribute("data-chikondi-boot"),
        fallback: document.getElementById("boot-fallback"),
        title: document.title,
        downloadLinks: document.querySelectorAll('a[href="/downloads/chikondi.apk"]').length,
        bodyText: document.body.innerText,
      }));
      check(
        "normal load commits the app",
        state.boot === "ready",
        `data-chikondi-boot=${state.boot}`,
      );
      check("static fallback is retired once React mounts", state.fallback === null);
      check("page has a title", Boolean(state.title), state.title);
      check(
        "uncaught exceptions: none",
        pageErrors.length === 0,
        pageErrors.join(" | ").slice(0, 200),
      );

      // `vite preview` cannot serve the serverless /api functions, so a 404
      // there stands in for an optional service being down: the home page must
      // still render and the download link must still work.
      const unexpected = failedResponses.filter((entry) => !entry.includes("/api/"));
      check(
        "no failed non-API requests",
        unexpected.length === 0,
        unexpected.join(" | ").slice(0, 200),
      );
      check(
        "a failing /api/releases/latest does not block the page",
        /Chikondi/.test(state.bodyText) && state.downloadLinks >= 1,
        `${failedResponses.length} api failure(s), ${state.downloadLinks} apk link(s)`,
      );
      await page.close();
    }

    // 2. Bundle 404 (stale cached HTML) -----------------------------------
    {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (/\/assets\/.*\.js$/.test(request.url())) {
          void request.respond({ status: 404, contentType: "text/plain", body: "gone" });
          return;
        }
        void request.continue();
      });
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForSelector("#boot-fallback", { timeout: 10_000 });
      const afterFailure = await page.evaluate(() => ({
        boot: document.documentElement.getAttribute("data-chikondi-boot"),
        hasApkLink: Boolean(
          document.querySelector('#boot-fallback a[href="/downloads/chikondi.apk"]'),
        ),
        bodyText: document.body.innerText.slice(0, 400),
      }));
      check("bundle 404 leaves the fallback on screen", afterFailure.boot !== "ready");
      check("fallback keeps the APK link", afterFailure.hasApkLink);
      check(
        "fallback explains the site is Chikondi",
        /Chikondi/.test(afterFailure.bodyText),
        afterFailure.bodyText.replace(/\s+/g, " ").slice(0, 80),
      );

      await page.waitForFunction(
        () => {
          const note = document.getElementById("boot-fallback-note");
          return Boolean(note && !note.hidden);
        },
        { timeout: WATCHDOG_WAIT_MS },
      );
      const noteText = await page.evaluate(
        () => document.getElementById("boot-fallback-message")?.textContent ?? "",
      );
      check("watchdog reveals a recovery note", noteText.length > 0, noteText.slice(0, 90));
      await page.close();
    }

    // 3. A script in <head> that never arrives ----------------------------
    {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (/\/(fit|boot)\.js$/.test(request.url())) {
          return; // leave it pending: the request never completes
        }
        void request.continue();
      });
      // Do not await the navigation: DOMContentLoaded cannot fire while a
      // deferred head script is still pending, and that is the point of the
      // test. What must happen regardless is that the body gets parsed.
      void page.goto(`${BASE}/`, { timeout: 0 }).catch(() => {});
      const parsed = await page
        .waitForSelector("#boot-fallback", { timeout: 8_000 })
        .then(() => true)
        .catch(() => false);
      check("a stalled head script no longer blocks the parser", parsed);
      const root = await page.evaluate(() => Boolean(document.getElementById("root")));
      check("#root is parsed even while the script hangs", root);
      await page.close();
    }

    // 4. Direct navigation to real routes ---------------------------------
    {
      const page = await browser.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(String(error)));
      for (const route of [
        "/download",
        "/install",
        "/releases",
        "/privacy",
        "/faq",
        "/legal/cookies",
      ]) {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2", timeout: 60_000 });
        await page.waitForSelector("main#main", { timeout: 20_000 });
        const ok = await page.evaluate(
          () =>
            document.documentElement.getAttribute("data-chikondi-boot") === "ready" &&
            Boolean(document.querySelector("h1")),
        );
        check(`deep link ${route} boots the app`, ok);
      }
      check(
        "deep links raise no exceptions",
        pageErrors.length === 0,
        pageErrors.join(" | ").slice(0, 200),
      );
      await page.close();
    }
  } finally {
    await browser.close().catch(() => {});
    server.kill();
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

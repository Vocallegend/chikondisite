# Chikondi — official website

The official website for **Chikondi**, the Android dating app. It introduces the
app, publishes the release information, and distributes the official Android APK
directly — there is no Google Play dependency anywhere in this project.

This is a **separate project from the Android app**. It does not contain, build
or modify the app itself.

- **Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4, lucide-react, Motion.
- **Hosting:** Vercel (static build + a few serverless functions).
- **Source of truth for releases:** `src/data/release.json`, generated from the
  real APK by `scripts/generate-release-manifest.mjs`.

---

## 1. What is in here

```
website/
├── api/                     Vercel serverless functions (routes)
│   ├── download.ts          GET /downloads/chikondi.apk  -> 302 to the published APK
│   ├── releases/latest.ts   GET /api/releases/latest     -> validated release metadata
│   └── contact.ts           GET/POST /api/contact        -> contact form delivery
├── server/                  Server-only helpers (not exposed as routes)
│   ├── email.ts             Resend delivery over HTTPS (no SDK)
│   ├── http.ts              Request/response helpers
│   └── rate-limit.ts        Upstash sliding window + in-memory fallback
├── shared/                  Code used by both the browser and the functions
│   ├── contact.ts           One validation rulebook for form input
│   └── release.ts           One meaning for a "release record"
├── src/                     The React site
│   ├── components/          Shared UI (Layout, Header, Footer, DownloadPanel …)
│   ├── data/                Site config, features, help copy, legal text, release.json
│   ├── lib/                 SEO, release loading, contact client
│   ├── pages/               One file per route
│   ├── App.tsx              Every route
│   ├── main.tsx             Entry point
│   └── styles.css           Design tokens (the app's real brand colours)
├── scripts/
│   ├── generate-release-manifest.mjs   APK -> src/data/release.json
│   ├── prepare-assets.mjs              Real logo/artwork -> public/
│   └── prerender-meta.mjs              Per-route static HTML + sitemap + robots
├── public/                  Static assets (brand, app artwork, icons)
├── tests/                   Vitest unit + function tests
└── vercel.json              Routing, caching and security headers
```

### Routes

| URL | Page |
| --- | --- |
| `/` | Home |
| `/download` | Download Chikondi |
| `/install` | Installation guide |
| `/releases` | Release notes |
| `/features` | Features |
| `/how-it-works` | How it works |
| `/safety` | Safety and privacy |
| `/about` | About |
| `/help` | Help centre |
| `/faq` | FAQ |
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/guidelines` | Community Guidelines |
| `/legal/safety-policy`, `/legal/data-retention`, `/legal/law-enforcement` | Supporting policies |
| `*` | Not found (noindex) |

---

## 2. Local development

```bash
cd website
npm install
npm run dev          # http://localhost:5173
```

The React app runs entirely in the browser here. The `/api/*` and
`/downloads/*` endpoints are Vercel Functions; to exercise them locally use the
Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build + SEO prerender into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit + function tests) |
| `npm run release:manifest` | Rebuild `src/data/release.json` from a real APK |
| `npm run assets:prepare` | Re-copy logo/artwork from the app into `public/` (one-off) |

Before shipping a change:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 3. Environment variables

Copy `.env.example` to `.env.local` for development. On Vercel, set the same
names under **Project → Settings → Environment Variables**. Nothing here is
required for the site to render — each variable turns a "not configured" state
into a working one. **Only `VITE_`-prefixed values reach the browser.**

| Variable | Scope | Effect when unset |
| --- | --- | --- |
| `SITE_URL` | Build | Canonical URLs, sitemap and robots use it. Without it they are root-relative. Set to the real domain. |
| `RELEASE_DOWNLOAD_URL` | Server | Where the published APK actually lives. Without it the download button reports "unavailable" — it never guesses. |
| `RELEASE_STABLE_URL` | Server | Overrides the `/downloads/chikondi.apk` stable link. Optional. |
| `RESEND_API_KEY` | Server | Contact form delivery. Without it `/api/contact` returns 503 and the page shows the fallback. |
| `CONTACT_TO_EMAIL` | Server | Where contact messages are delivered. |
| `CONTACT_FROM_EMAIL` | Server | Verified Resend sender. |
| `CONTACT_FALLBACK_EMAIL` | Server | Address shown when the form is not configured. Leave blank to hide it (never invent one). |
| `UPSTASH_REDIS_REST_URL` | Server | Shared rate limiting across functions. Optional. |
| `UPSTASH_REDIS_REST_TOKEN` | Server | As above. |

No APK signing key, keystore password or storage secret belongs in this project.

---

## 4. How the release system works

```
Android build  ──►  generate-release-manifest.mjs  ──►  src/data/release.json
                                                              │
                     ┌────────────────────────────────────────┼───────────────────────────────┐
                     ▼                                        ▼                               ▼
              /download page                        /api/releases/latest            /downloads/chikondi.apk
          (reads the manifest,                   (validated JSON metadata)          (302 to RELEASE_DOWNLOAD_URL)
           then refreshes live)
```

The APK itself is **never committed**. The repository holds metadata; the file
lives in external storage. That is deliberate: a multi-megabyte binary in git is
unrecoverable history, and git is not a download host.

### 4.1 Publishing a new release

1. **Bump the app version.** In `android/app/build.gradle`, raise `versionCode`
   (must be greater than the previous published release) and set `versionName`.
2. **Build and sign** the release APK with the established production signing
   identity. Never change the signing certificate — updates rely on it.
3. **Verify the signature**:
   ```bash
   apksigner verify --print-certs android/app/release/CHIKONDI-<version>.apk
   ```
4. **Add release notes** to `src/data/release-notes.json`, keyed by `versionName`.
5. **Generate the manifest** (reads the APK's real size and SHA-256):
   ```bash
   cd website
   npm run release:manifest -- --apk ../android/app/release/CHIKONDI-<version>.apk
   ```
   Confirm the printed version, size and checksum, and that `release.json` now
   has the new entry with `"published": true`.
6. **Upload the APK to release storage** (see §5) using a versioned file name,
   e.g. `chikondi-<version>.apk`. Keep previous versions.
7. **Point the site at it.** Either set `RELEASE_DOWNLOAD_URL` in Vercel to the
   new file's HTTPS URL and redeploy, or set the release's own `downloadUrl` in
   `release.json`. The stable URL `/downloads/chikondi.apk` starts serving the
   new build immediately.
8. **Deploy** (push to the production branch, or `vercel --prod`).
9. **Verify in production**: open `/download`, check the version, size and
   SHA-256, download the file, and confirm its checksum matches:
   ```bash
   # Windows
   certutil -hashfile chikondi-<version>.apk SHA256
   # macOS / Linux
   sha256sum chikondi-<version>.apk
   ```

> Only mark a release `"published": true` **after** steps 3–6 pass. An
> unpublished release is dropped from the manifest by validation, so an
> unfinished build cannot leak to visitors by accident.

### 4.2 Rolling back

Two independent levers:

- **Website rollback:** in Vercel → Deployments, promote the last good
  deployment. The site reverts to the metadata it shipped with.
- **Release rollback:** point `RELEASE_DOWNLOAD_URL` (or the release's
  `downloadUrl`) back at the previous version's file. Because versioned
  artifacts are kept, the old APK is still there.

Do not delete the previous artifact until the new one is verified in production.

---

## 5. Release storage

Any HTTPS host works. Pick one and keep the URLs stable:

- **GitHub Releases** — attach `chikondi-<version>.apk` to a tagged release, then
  use the asset URL. Simple, free, versioned. Good default for this project.
- **S3-compatible object storage** — e.g. Cloudflare R2, Backblaze B2, Supabase
  Storage. Versioned keys, a public read policy or a signed URL.
- **Vercel Blob** — integrated with the deployment platform.

Requirements for whichever you choose:

- The file must be reachable over **HTTPS**.
- Keep every published version; do not overwrite in place in a way that destroys
  the previous file.
- Do not expose private write credentials to the serverless functions. They only
  ever perform an HTTPS redirect to a public URL.

Optional local drop-zone: `public/releases/*.apk` is git-ignored, so a file can
sit there during local testing without risk of being committed.

---

## 6. Deploying to Vercel

### 6.1 GitHub

```bash
git add website
git commit -m "Add the Chikondi website"
git push
```

The site is self-contained under `website/`, so it can live in its own repository
or as a subdirectory of the app repository. Either way, the whole source tree
belongs in git — **never the APK**.

### 6.2 Vercel

1. **Import the repository** at <https://vercel.com/new>.
2. Set **Root Directory** to `website`.
3. Framework preset **Vite** is detected from `vercel.json`
   (`buildCommand: npm run build`, `outputDirectory: dist`).
4. **Environment variables** → add the ones you need from §3, at minimum
   `SITE_URL` and `RELEASE_DOWNLOAD_URL` for production.
5. **Deploy.**
6. **Add the domain** → Project → Settings → Domains. Then set `SITE_URL` to
   that exact origin (no trailing slash) and redeploy so canonical URLs,
   `sitemap.xml` and `robots.txt` use it.

`vercel.json` already configures:

- the SPA rewrite (with `/api`, `/assets`, `/brand`, `/app` and file requests
  excluded),
- `/downloads/*` → the download function,
- long-lived immutable caching for hashed assets,
- no-store for the download redirect,
- `s-maxage` caching for `/api/releases/latest`,
- security headers (`HSTS`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, CSP).

The site needs no always-on server and no database.

### 6.3 The functions

`api/contact.ts` is the only function that needs credentials, and it degrades to
a clear 503 with a configured fallback address when they are absent.
`api/releases/latest.ts` and `api/download.ts` need only
`RELEASE_DOWNLOAD_URL` (optional) and read the committed manifest.

> **Keep the imports ESM-explicit.** Vercel runs these functions as native ES
> modules. Every relative import across `api/`, `server/` and `shared/` must
> carry a `.js` extension (e.g. `../shared/release.js`), and the JSON manifest
> import needs `with { type: "json" }`. Extensionless imports work under
> `vercel dev`, so they pass locally, but in a real deployment every function
> fails with `FUNCTION_INVOCATION_FAILED`.

---

## 7. Testing

```bash
npm run typecheck   # types across src, api, server, shared, scripts
npm run lint        # eslint
npm run test        # vitest
npm run build       # production build + SEO prerender
```

The tests cover:

- **release validation** (`tests/release.test.ts`) — malformed versions,
  checksums, dates, non-HTTPS URLs, unpublished releases, version ordering and
  formatting;
- **`/api/releases/latest`** (`tests/api-releases.test.ts`) — real manifest
  values, honest `downloadAvailable`, no leaked secrets, method handling;
- **`/downloads/chikondi.apk`** (`tests/api-download.test.ts`) — a 302 (not 301)
  to the configured APK, an honest 503 when nothing is configured, a refused
  non-HTTPS override, and method handling;
- **`/api/contact`** (`tests/api-contact.test.ts`) — configuration status,
  field validation, honeypot and too-fast rejection, the unconfigured 503,
  successful delivery through a stubbed Resend, a surfaced delivery failure,
  rate limiting, and method handling.

Manual checks worth repeating after a release change:

- `/download` shows the real version, size, date and checksum.
- With `RELEASE_DOWNLOAD_URL` unset, the button reads "unavailable" rather than
  linking somewhere wrong.
- With it set, the button downloads the file and the checksum matches.
- `/api/releases/latest` returns the same values the page shows.
- Every route renders; the 404 page appears for an unknown URL.
- The contact form either sends, or shows the configured fallback — it never
  shows a fake success message.

---

## 8. What still needs a real decision

These are intentionally blank in the source; the UI shows an honest "not
configured" state until they are filled in. Nothing here is invented.

| Item | Where |
| --- | --- |
| Production domain | Vercel domain + `SITE_URL` |
| APK download location | `RELEASE_DOWNLOAD_URL` or `release.json` |
| Contact delivery (Resend key, addresses) | Vercel env vars |
| Legal entity, registered address, contact email | `src/data/legal.ts` → `LEGAL_PLACEHOLDERS` |
| Company details / social links | `src/data/site.ts` → `company`, `social` |

When the legal placeholders are filled in, `LEGAL_CONFIG_READY` becomes true and
the "not yet finalised" notice disappears from the Privacy Policy and Terms.

---

## 9. Brand and assets

`public/brand/chikondi-logo.png` and the in-app artwork under `public/app/` are
the **real** assets from the Chikondi Android project, copied by
`scripts/prepare-assets.mjs`. The palette in `src/styles.css` uses the app's own
Tailwind tokens (brand red `oklch(0.55 0.22 27)`, dark ink surfaces, gold
accent), so the site and the app are visibly the same product.

If the app's logo or brand colours change, re-run:

```bash
npm run assets:prepare
```

and update the `--color-brand-*` / `--color-ink-*` tokens in `src/styles.css`.

---

## 10. Licensing and attribution

Chikondi is distributed as a direct Android download and is **not** published on
Google Play. Android and Google Play are trademarks of Google LLC; Chikondi is
not affiliated with, endorsed by or sponsored by Google. This project
deliberately does not use the Google Play In-App Updates API or any other
Google-Play-dependent mechanism.

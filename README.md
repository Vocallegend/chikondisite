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
│   ├── store.ts             Supabase row for the admin console (service role)
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

The React app runs entirely in the browser here. The `/api/*` endpoints (and the
`/downloads/chikondi.apk` / `/downloads/chikondi-latest.apk` redirects that lead
to one) are Vercel Functions; to exercise them locally use the Vercel CLI:

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
| `npm run release:manifest` | Rebuild `src/data/release.json` from a real APK (app repo; reads Gradle) |
| `npm run release:publish` | Upload an APK to this site and record it (see §4.1) |
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
| `RELEASE_DOWNLOAD_URL` | Server | Optional external HTTPS host for the APK. When set it wins over the APK hosted here. Leave unset to serve the committed APK from `public/downloads/`. |
| `RELEASE_STABLE_URL` | Server | Overrides the `/downloads/chikondi.apk` stable link. Optional. |
| `RESEND_API_KEY` | Server | Email delivery for the contact form. One of two delivery paths; without any path `/api/contact` returns 503 and the page shows the fallback. |
| `CONTACT_TO_EMAIL` | Server | Where contact messages are emailed. |
| `CONTACT_FROM_EMAIL` | Server | Verified Resend sender. |
| `CONTACT_FALLBACK_EMAIL` | Server | Address shown when the form is not configured. Leave blank to hide it (never invent one). |
| `SUPABASE_URL` | Server | Supabase project URL. With the key below, `/api/contact` also stores each message for the Admin Control Centre. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service-role key (bypasses RLS). **Server only — never a `VITE_` variable and never in the browser.** |
| `UPSTASH_REDIS_REST_URL` | Server | Shared rate limiting across functions. Optional. |
| `UPSTASH_REDIS_REST_TOKEN` | Server | As above. |

No APK signing key, keystore password or storage secret belongs in this project.

---

## 4. How the release system works

```
Android build ──► release:publish ──► public/downloads/chikondi-<version>.apk
                       │                              │
                       ▼                              │ (served directly by Vercel)
                src/data/release.json                 │
                       │                              │
   ┌───────────────────┼──────────────────────────────┴──────────────┐
   ▼                   ▼                                             ▼
/download page   /api/releases/latest                    /downloads/chikondi.apk
(reads the        (validated JSON metadata)               (302 to the newest APK)
 manifest)
```

By default this site **hosts the APK itself**: `npm run release:publish` copies
the file into `public/downloads/` and Vercel serves it directly — no external
storage, no credentials. The APK is committed so the deploy can serve it; keep
each build under Vercel's 100 MB static-file limit. If you would rather keep
binaries out of git, keep only the metadata step and set `RELEASE_DOWNLOAD_URL`
to an external HTTPS host instead (§5) — the endpoint then redirects there.

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
5. **Publish it** — copies the APK into `public/downloads/` and updates
   `src/data/release.json` (real size and SHA-256 read from the file itself):
   ```bash
   cd website
   npm run release:publish -- --apk ../android/app/release/CHIKONDI-<version>.apk --code <versionCode>
   ```
   The version is read from the file name (`CHIKONDI-1.0.2.apk` → `1.0.2`); pass
   `--version` if it is not in the name. Confirm the printed version, size and
   checksum, and that `release.json` now has the entry with `"published": true`.
   (To host externally instead, use `npm run release:manifest` for the metadata
   and set `RELEASE_DOWNLOAD_URL` — see §5.)
6. **Deploy** (commit and push, or `vercel --prod`). The stable URL
   `/downloads/chikondi.apk` starts serving the new build immediately.
7. **Verify in production**: open `/download`, check the version, size and
   SHA-256, download the file, and confirm its checksum matches:
   ```bash
   # Windows
   certutil -hashfile chikondi-<version>.apk SHA256
   # macOS / Linux
   sha256sum chikondi-<version>.apk
   ```

> Only mark a release `"published": true` **after** steps 3–5 pass. An
> unpublished release is dropped from the manifest by validation, so an
> unfinished build cannot leak to visitors by accident.

### 4.2 Rolling back

Two independent levers:

- **Website rollback:** in Vercel → Deployments, promote the last good
  deployment. The site reverts to the metadata it shipped with.
- **Release rollback:** the previous version is still in `public/downloads/`
  (e.g. `chikondi-1.0.0.apk`). Point the release's `downloadUrl` back at it, or
  set `RELEASE_DOWNLOAD_URL` to any HTTPS copy. Versioned artifacts are kept, so
  the old APK is still there.

Do not delete the previous artifact until the new one is verified in production.

---

## 5. Release storage

**Default: this site hosts the APK.** `npm run release:publish` writes the file
to `public/downloads/chikondi-<version>.apk` and Vercel serves it directly. No
extra service, no keys. Vercel's limit for a single static file is 100 MB, so
every APK must be smaller than that.

**Alternative: external HTTPS storage.** If you would rather keep binaries out
of git, upload the APK anywhere stable and set `RELEASE_DOWNLOAD_URL` to its
URL. Any HTTPS host works:

- **GitHub Releases** — attach `chikondi-<version>.apk` to a tagged release, then
  use the asset URL. Simple, free, versioned.
- **S3-compatible object storage** — e.g. Cloudflare R2, Backblaze B2, Supabase
  Storage. Versioned keys, a public read policy or a signed URL.
- **Vercel Blob** — integrated with the deployment platform.

Requirements for whichever you choose:

- The file must be reachable over **HTTPS**.
- Keep every published version; do not overwrite in place in a way that destroys
  the previous file.
- Do not expose private write credentials to the serverless functions. They only
  ever perform an HTTPS redirect to a public URL.

`public/releases/*.apk` is git-ignored — a scratch drop-zone for local testing
only; published APKs belong in `public/downloads/`.

---

## 6. Deploying to Vercel

### 6.1 GitHub

```bash
git add website
git commit -m "Add the Chikondi website"
git push
```

The site is self-contained under `website/`, so it can live in its own repository
or as a subdirectory of the app repository. The source tree belongs in git, and
so does the published APK under `public/downloads/` — Vercel serves it straight
from the deploy. Keep `dist/`, `node_modules/` and secrets out.

### 6.2 Vercel

1. **Import the repository** at <https://vercel.com/new>.
2. Set **Root Directory** to `website`.
3. Framework preset **Vite** is detected from `vercel.json`
   (`buildCommand: npm run build`, `outputDirectory: dist`).
4. **Environment variables** → add the ones you need from §3. `SITE_URL` is the
   important one; `RELEASE_DOWNLOAD_URL` is only needed for external storage.
5. **Deploy.**
6. **Add the domain** → Project → Settings → Domains. Then set `SITE_URL` to
   that exact origin (no trailing slash) and redeploy so canonical URLs,
   `sitemap.xml` and `robots.txt` use it.

`vercel.json` already configures:

- the SPA rewrite (with `/api`, `/downloads`, `/assets`, `/brand`, `/app` and
  file requests excluded),
- `/downloads/chikondi.apk` and `/downloads/chikondi-latest.apk` → a temporary
  redirect to the download function (which 302s to the newest APK). This mapping
  is a `redirect`, not a `rewrite`: Vercel did not apply the rewrite to those
  `.apk` paths, so the published download button 404'd. Redirects run before the
  filesystem and do work. Versioned `/downloads/chikondi-<v>.apk` files are
  served as static files with `Content-Disposition: attachment`,
- long-lived immutable caching for hashed assets,
- no-store for the download endpoint and APK files,
- `s-maxage` caching for `/api/releases/latest`,
- security headers (`HSTS`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, CSP).

The site needs no always-on server. It reads no database; when Supabase delivery
is configured it writes contact messages to one.

### 6.3 The functions

The site needs no always-on server. It reads no database; when Supabase delivery
is configured it also writes contact messages to one.

### 6.3 The functions

`api/contact.ts` is the only function that needs credentials. It delivers each
message to every path that is configured:

- **Supabase** (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) — inserts a row
  into `public.website_contact_messages`, which is exactly what the Admin
  Control Centre shows under **Website Messages**. This needs the migration
  `supabase/migrations/20261016090000_website_contact_messages.sql` applied by
  hand first (see `AGENTS.md`).
- **Resend** (`RESEND_API_KEY` + addresses) — sends the email.

Delivery succeeds when at least one path accepts the message. With none
configured it degrades to a clear 503 with the configured fallback address; when
every configured path fails it returns 502. It never reports a fake success.

> The service-role key bypasses row-level security. Keep it in the serverless
> environment only: never a `VITE_` variable, never in the browser.

`api/releases/latest.ts` and `api/download.ts` read the committed manifest and
need no credentials; they use `RELEASE_DOWNLOAD_URL` only when you host the APK
externally.

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
  checksums, dates, non-HTTPS URLs, site-hosted paths, unpublished releases,
  version ordering and formatting;
- **`/api/releases/latest`** (`tests/api-releases.test.ts`) — real manifest
  values, honest `downloadAvailable`, no leaked secrets, method handling;
- **`/downloads/chikondi.apk`** (`tests/api-download.test.ts`) — a 302 (not 301)
  to the hosted APK, an https override taking precedence, a refused non-HTTPS
  override, and method handling;
- **`/api/contact`** (`tests/api-contact.test.ts`) — configuration status,
  field validation, honeypot and too-fast rejection, the unconfigured 503,
  Supabase storage, successful delivery through a stubbed Resend, one path
  failing while another succeeds, a surfaced total delivery failure, rate
  limiting, and method handling.

Manual checks worth repeating after a release change:

- `/download` shows the real version, size and date.
- After `npm run release:publish`, `/downloads/chikondi.apk` redirects to the
  new file and the button downloads it.
- With no APK published and no `RELEASE_DOWNLOAD_URL`, the button reads
  "unavailable" rather than linking somewhere wrong.
- `/api/releases/latest` returns the same values the page shows.
- With Supabase configured, a test contact message appears in the Admin Control
  Centre under **Website Messages**; with Resend configured it also arrives by
  email.
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
| APK download location | `public/downloads/` (via `npm run release:publish`) or `RELEASE_DOWNLOAD_URL` |
| Contact delivery — email (Resend key, addresses) | Vercel env vars |
| Contact delivery — admin console (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | Vercel env vars + apply `supabase/migrations/20261016090000_website_contact_messages.sql` by hand |
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

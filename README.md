# Customs Studio — Iraq shipping administration

A **non-government** Arabic RTL dashboard for managing shipment records, company directory, drivers, traders, receipts, and account ledgers. This is an **independent internal records system**, not a government customs portal or a source of officially authenticated documents.

## Stack
React 18 + Vite 5 + TypeScript + Tailwind CSS 3; Motion page transitions; GSAP ScrollTrigger reveal animations; lazy Three.js / React Three Fiber hologram for larger screens only. Mobile devices use lightweight CSS Aurora instead of WebGL.

## Run
```bash
npm install
npm run typecheck
npm run dev
npm run build
```

## Cloudflare Pages
- GitHub repository: `abdulstarzeki001-sketch/Iraq-coustoms`
- Production branch: `main`
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION=22`
- `public/_redirects` provides SPA route fallback.

GitHub Actions now checks TypeScript, imported-source safeguards and the production build. Cloudflare Pages can publish via **native GitHub integration** (recommended) or via the separate manual workflow **Publish Iraq Customs Studio to Cloudflare Pages**. The manual workflow builds `dist`, checks the account and project using the API, then deploys only if permissions are valid. It does not automatically replace the legacy live Pages site.

## Data migration
The original public `data/companies.json` from the user-owned `abdulstarzeki001-sketch/raq-customs` repository has now been restored as `public/data/companies.json` with **839 records**. The catalog loads automatically when there are no user-imported companies; previously imported companies are never overwritten. This is a *legacy reference dataset*, not live government verification. Manual JSON import remains available from **Companies** or **Settings**, accepting arrays or `{"companies": [...]}`. Legacy uppercase fields such as `Number`, `CompanyNameProject`, `LicenseApprovalNumber`, `TypeIndustryProduction` are recognized.

Documents, traders and payments are saved in the **same browser's localStorage** under `customs_studio_database_v1`. Data do not sync between devices. Export a JSON backup in Settings frequently. Large QR images may exceed browser quota. To deploy a multi-user system, add a server-side authenticated API, role-based permissions and an auditable database; do not publish private Neon database credentials in this SPA.

## Functional routes
- `/` Dashboard / smart shortcuts / recent records
- `/companies` Search and import companies + auto-populate
- `/documents` Searchable list, CSV export
- `/documents/new` Document creation, driver and cargo details, optional QR attachment, automatic trader debit
- `/documents/:id` A4 printing / browser Save PDF (non-official template)
- `/traders` Account creation, receipt and settlement, chronological ledger, CSV, print to PDF
- `/settings` JSON backup, restore and destructive reset with two confirmations

## Security and operational notes
No official state imagery or false government verification is built in. Uploaded QR imagery is presented as **unverified**. This frontend provides a record-keeping interface only. For official documents, use the competent authority's legitimate issuance and verification services.

Responsive navigation persists on all six major routes; iPhone safe-area insets, touch targets, reduced-motion and print media styles are included.

## Imported original front-end sources (October 2026)

User-provided JS and CSS files were preserved in `legacy/js/` and `legacy/css/` so the original implementation can be inspected or further ported. They are **not loaded at runtime** because their direct DOM manipulation and legacy global selectors would conflict with the new React application.

The active React implementation now ports functional concepts from these source files:
- Company searching/autofill from `index-page.js`
- Driver suggestions and registration from `form-page.js` + `storage.js`
- Persisted form draft with QR image omitted from the draft to avoid storage limits
- Legacy document, trader, and payment import/merging by original keys from `storage.js` and `traders-page.js`
- Original RTL and print layout guidelines adapted to the new CSS

**Important security warning:** `legacy/js/sync.js` is a deliberately sanitized *disabled adapter*. Its originally uploaded counterpart contained a hard-coded cloud sync token. Do not restore that token to client code. Rotate/revoke it in the existing Cloudflare setup, and use authenticated server-side endpoints before enabling synchronization.

In Settings, if the new site runs under the same origin where old localStorage data exists, a legacy migration panel is shown. If it runs under a different site/domain, browsers cannot read the old origin's localStorage. Export legacy data explicitly from the old application and import the JSON into the new app. Imports are non-destructive to current records, but always export a backup first.

## Source-aligned upgrade (22 October 2026)

- Restored the public 839-company directory from the older repository without creating fake companies.
- Preserved user data, accounting and form drafts. Auto-catalog loads only for empty company directories.
- Converted the reference document structure to React: document metadata, company license details, driver/cargo, products, trader values and optional unverified QR.
- Added A4 print CSS that leaves text and tables as **native selectable PDF content**, instead of rasterizing an HTML screenshot. Safari: tap **Print / Save PDF** and save/share the PDF from the print preview. Image QR clarity still depends on the uploaded image resolution.
- Removed hardcoded sample driver identities; saved driver suggestions remain local to the device.
- Allow zero-value documents. QR uploads accept PNG/JPEG/WebP with a 1.5 MB limit.
- The original Vue 3 production bundle, server APIs, session authentication, official QR validation and Cloudflare Functions were not supplied. This is a source-aligned local adaptation, not a pixel-identical or government-issued system.

## Deploy this new repository — do not confuse it with legacy Pages

Account ID supplied for this repository: `d45cb55f3d7654fc0eee90ca0e844378`. **A valid account ID does not prove that the Pages project already exists.** The previous account `d2680f7c5ff39f8d9177a51dbf7fec75` belonged to an earlier project link. Never deploy across accounts or overwrite a live site without checking the project.

1. In Cloudflare **Workers & Pages**, create a **new Pages project** attached to `Iraq-coustoms` or confirm an existing one. Use the **Vite** preset, build `npm run build`, output `dist`, production branch `main`.
2. Native Git integration publishes on pushes to main and does not need a GitHub Actions API token.
3. Alternatively, create a **Cloudflare API token** with `Account → Cloudflare Pages → Edit`, scoped to the account containing this Pages project. Add only the token string under the GitHub Actions **Repository secret** `CLOUDFLARE_PAGES_TOKEN` (fallback: `CLOUDFLARE_API_TOKEN`). If needed, set `CLOUDFLARE_ACCOUNT_ID` to the correct account.
4. From GitHub Actions manually run **Publish Iraq Customs Studio to Cloudflare Pages**, entering the **exact existing Pages project name**. The proposed default is `iraq-coustoms`, but it is not confirmed. The workflow first checks for HTTP 401/403 (invalid token/permissions) and 404 (missing project) and refuses to upload on failure.

**R2** `Access Key ID`, `Secret Access Key` and `S3 API endpoint` are for R2 object storage, *not Cloudflare Pages*. Never paste credentials into the repository or chat.

No Supabase sync, Cloudflare KV data or server-side authentication has been connected. Business records and user-uploaded QR remain browser-local and should be backed up via Settings before changing domains or devices.

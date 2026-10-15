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

The GitHub Actions workflow checks types and production build on commits/PRs. Cloudflare Pages deployment requires connecting the repository in your Cloudflare account, and is **not automatic** just from the files.

## Data migration
The HTML files supplied in the conversation referenced `data/companies.json` and a 839-company dataset, but the JSON dataset was not included. No company records are fabricated. Import the original company list from **Companies** or **Settings**, accepting JSON arrays or `{"companies": [...]}`. Legacy uppercase fields such as `Number`, `CompanyNameProject`, `LicenseApprovalNumber`, `TypeIndustryProduction` are recognized.

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

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

The repository intentionally contains **no** original authoritative customs companies dataset; `data/companies.json` was referenced by old scripts but not supplied. Import that file through the Companies screen when available.


## تحسين PDF عالي الوضوح (2026-10-22)

- من صفحة المستند استخدم زر **طباعة A4 / حفظ PDF واضح**. يولّد المتصفح PDF من النصوص والجداول المتجهية، وليس من صورة للشاشة؛ لذلك يظل النص واضحاً عند التكبير.
- على iPhone/iPad في Safari افتح الطباعة ثم مشاركة المعاينة إلى تطبيق الملفات. في خيارات الطباعة اختر A4 و100% إذا كانت متاحة.
- CSS يعيد شكل A4 الأصلي في الطباعة حتى على الشاشات الضيقة، ويمنع إضافة صفحة فارغة بعد نهاية المستند ويحافظ على صفوف الجداول.
- دقة أي QR أو شعار *نقطي* مرفوع محدودة بدقة الملف الأصلي؛ تحويله إلى PDF لا يخلق بكسلات إضافية.
- هذه وثيقة إدارية داخلية، لا وثيقة صادرة عن جهة حكومية.

## نشر Cloudflare Pages الآمن

Workflow: `.github/workflows/cloudflare-pages.yml` (على `main`، أو تشغيل يدوي). ينفذ اختبارات TypeScript، بناء Vite الحقيقي `dist/`، يرفع نسخة ZIP للتوثيق، ثم يتحقق من الصلاحيات قبل رفع الموقع. لا ينسخ ملفات النسخة القديمة إلى الموقع الجديد.

إعدادات GitHub → **Settings → Secrets and variables → Actions**:

1. **Repository secret**: `CLOUDFLARE_PAGES_TOKEN` ← مفتاح API من Cloudflare مع **Account → Cloudflare Pages → Edit** على حساب مشروع Pages. **لا تستخدم** `Access Key ID` أو `Secret Access Key` أو `S3 endpoint` الخاصة بـR2.
2. **Repository variable** (اختياري إذا اختلف المشروع): `CLOUDFLARE_PAGES_PROJECT` ← الاسم الحقيقي للمشروع في Workers & Pages. الافتراضي `iraq-coustoms` **تخمين من اسم المستودع وليس مشروعاً متحققاً منه**.
3. **Repository variable** (اختياري): `CLOUDFLARE_ACCOUNT_ID` ← معرّف حساب Cloudflare الذي يملك مشروع Pages؛ الافتراضي هو المعرّف الذي زوّد به المالك `d45cb55f3d7654fc0eee90ca0e844378`.

عند عدم وجود التوكن تنجح عملية البناء ولكن يظهر **NOT DEPLOYED** ولا تُنشر الملفات. عند رفض المفتاح أو غياب المشروع يتوقف النشر قبل الرفع برسالة واضحة (403 أو 404). Cloudflare Dashboard قد يحتوي مشروعاً في حساب مختلف أو باسم مختلف؛ لا تستبدل الموقع الأصلي قبل أخذ نسخة احتياطية من بياناته وخدماته. **لا ترفع المفاتيح إلى GitHub ككود ولا ترسلها بالمحادثة.**

الاختبارات: `node --test tests/*.test.mjs` ثم `npm run typecheck` و`npm run build`.

# Original source archive

These files come from uploads supplied for reconstruction of the earlier HTML/CSS/JavaScript app.

- `js/index-page.js`: company search UI
- `js/form-page.js`: document validation, draft, QR and driver suggestions
- `js/storage.js`: original browser storage keys and ledger transformations
- `js/traders-page.js`: traders/receipts/accounting UI
- `js/sync.js`: **secure replacement stub**: credential removed and cloud sync disabled
- `css/*.css`: original visual styles for reference, NOT imported into the modern React app

The running React app is in `src/`. The original scripts directly manipulate HTML by element ID and must not be executed over React screens. An opt-in legacy data migration is implemented separately in `src/lib/legacyMigration.ts`.

The original sync credential was present in material uploaded in this chat; rotate the credential. Browser-stored cloud secrets are never appropriate for authentication.

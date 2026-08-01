<!-- Explain *why* the change is needed, not just what it does. -->

## Why

## What changed

## Checks

- [ ] `npm run lint`, `npm test` and `npm run build` pass locally (CI runs all three)
- [ ] New logic in `src/core/` has unit tests — it is framework-free on purpose,
      so there is no excuse for testing it through the UI
- [ ] If the persisted shape changed: `SCHEMA_VERSION` in
      `src/store/persistence.js` is bumped and `validate()` updated, so an
      existing user's saved reports are discarded cleanly rather than
      half-loaded
- [ ] If a user-facing string changed: **both** `src/i18n/en.js` and
      `src/i18n/pl.js` are updated — the catalogue-parity test fails otherwise
- [ ] If a dependency was added: it earns its bundle size. Check the
      `npm run build` chunk output before and after

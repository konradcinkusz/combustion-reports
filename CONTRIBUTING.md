# Contributing to CombustionReports

Thanks for your interest. This document covers setting up a development
environment, the layout of the code, and what a reviewable change looks like.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20 or newer | `node --version` to verify. CI runs 20 and 22 |
| npm | ships with Node | the lockfile is npm's; please don't add a yarn/pnpm one |

Nothing else. There is no database, no backend and no Docker requirement —
the app is a static SPA that keeps its data in the browser.

## Quick dev loop

```bash
git clone https://github.com/konradcinkusz/CombustionReports.git
cd CombustionReports
npm install

npm run dev        # http://localhost:5173, hot reload
npm test           # the whole suite, ~3 s
npm run test:watch # re-runs on save
npm run lint
npm run build      # production build into build/
npm run preview    # serve that build locally
```

## Project layout

```
src/core/          Pure domain logic — regression fitting, combustion maths,
                   validation. No React, no Redux, no DOM. Unit-tested directly.
src/store/         Redux Toolkit slices and the localStorage persistence layer.
src/components/    Presentational components shared across pages.
src/pages/         One component per route.
src/hooks/         Reusable stateful logic (form state + validation).
src/i18n/          Message catalogues and the translation provider.
src/test/          Test setup and the render-with-providers helper.
```

**`src/core` is the important boundary.** It is deliberately framework-free:
it has no imports from React, Redux or the DOM, so it can be tested without
rendering anything and would port to a server project unchanged. Domain logic
belongs there, not in a component. If you find yourself computing something in a
`.jsx` file, that is usually a sign it should move.

## Testing

```bash
npm test
```

The suite covers the domain maths, the reducers and their referential-integrity
rules, the persistence round-trip, the i18n catalogues, and a render of every
route. It needs no browser and no network.

Two conventions worth knowing:

- **Charts are stubbed.** `src/components/Plot.jsx` is the only module that
  binds plotly to React, and `src/test/setup.jsx` replaces it. jsdom has no
  layout engine, so a real plotly render tests nothing but plotly.
- **Locale is pinned to English** in `renderWithProviders`, so assertions do not
  depend on the machine's `navigator.languages`.

Please add tests for new logic in `src/core/` — it is framework-free precisely so
that testing it is cheap.

## Things that will come up in review

- **Both message catalogues.** `src/i18n/en.js` and `src/i18n/pl.js` must define
  the same keys. A test enforces this; a missing Polish key would otherwise ship
  as English text in a Polish UI.
- **Bundle size.** Check the chunk sizes printed by `npm run build` before and
  after adding a dependency. The 1.0 rewrite cut the gzipped bundle from 1.5 MB
  to under 500 kB and it would be a shame to give that back.

  Note the `overrides` block in `package.json`: `react-plotly.js` peer-depends
  on the full `plotly.js` build (~97 MB installed, ~4.9 MB bundled). We bind the
  *basic* bundle through `react-plotly.js/factory` in `src/components/Plot.jsx`
  and alias the peer so npm never fetches the full one. Don't import `plotly.js`
  directly — that alias would silently give you the basic build anyway.
- **Persisted-shape changes.** If you change what goes into `localStorage`, bump
  `SCHEMA_VERSION` in `src/store/persistence.js` and update `validate()`. An
  existing user's snapshot should be discarded cleanly, never half-loaded.
- **Deleting things must not orphan others.** Deleting a car deletes its
  reports; deleting a fuel detaches it from cars. If you add an entity with
  references, handle its removal the same way and test it.

## Submitting changes

1. Fork the repository and create a branch from `master` (the default branch).
2. Make the change, with tests.
3. Confirm `npm run lint`, `npm test` and `npm run build` all pass.
4. Open a pull request and fill in the template — the *why* matters more than
   the *what*, which the diff already shows.

Small, focused pull requests get reviewed faster than large ones. If you are
planning something substantial, open an issue first so we can agree on the
approach before you spend the time.

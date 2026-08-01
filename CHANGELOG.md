# Changelog

Notable changes per release. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-01

First release intended to be used, run and read by someone other than the
author. The 2019 prototype could not be installed on a current Node, lost every
record on refresh, and rendered one of its own navigation links as a blank
screen.

### Added

- **Persistence.** Cars, fuels and reports are stored in `localStorage` and
  survive a reload. Writes are debounced, versioned by schema, validated on
  load, and degrade to in-memory rather than throwing when storage is blocked or
  full. The prototype initialised Firebase but never read from or wrote to it,
  so all state was lost on refresh — the app's central purpose, tracking
  consumption *over time*, did not work.
- **A framework-free `src/core/` domain layer** — polynomial fitting, combustion
  statistics and field validation, with no React, Redux or DOM imports, tested
  directly.
- **English and Polish UI** with a language switcher, browser-language detection
  and a remembered choice. The prototype's interface was Polish-only.
- **Referential integrity.** Deleting a car deletes its reports; deleting a fuel
  detaches it from the cars that referenced it, instead of leaving a dangling id
  that rendered as a permanent blank.
- **A summary panel** — report count, total distance, fuel burned,
  distance-weighted average consumption, best and worst figures, and estimated
  cost from the car's fuel price.
- **80 tests** (Vitest) covering the domain maths, reducers, persistence
  round-trip, i18n catalogue parity and a render of every route.
- **CI** running lint, tests and build on Node 20 and 22; a Pages workflow;
  issue and pull-request templates; Dependabot; `LICENSE` (MIT),
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and `SECURITY.md`.
- **Docker support** — a multi-stage build serving the static output from nginx.

### Fixed

- **`npm install` failed outright on Node 18 and newer.** `firebase@6.6.0`
  pulled `grpc@1.23.3`, a native module with no prebuilt binary for a modern
  Node ABI; the fallback source compile failed. Nobody could install the project
  as it stood. Firebase is gone entirely.
- **The `/route` page rendered a blank screen.** `RouteReport` passed an
  `entries` prop while `Polynomial` unconditionally read
  `props.regression.string`, so the page threw
  `Cannot read properties of undefined`. The route was linked from the main
  navigation. `fitPolynomial` now always returns a well-formed model, and the
  not-enough-data case is a rendered message rather than a crash.
- **Typing a fuel name threw `fuelItems.filter is not a function`.** The
  duplicate-name check called `.filter` on the slice *object* rather than its
  array, so the validation it was meant to perform never ran.
- **Reports were validated with `parseFloat`,** which accepts `12abc` as `12`
  and stored the result as a measurement. Values are parsed with `Number` now.
- **`Car.componentWillMount` mutated `this.props.cars` in place** before
  dispatching — a direct write to Redux state.
- **The full Redux state was logged to the console on every action,** in
  production builds.
- **A `debugger` statement** in `Polynomial.shouldComponentUpdate` halted
  devtools on every re-render in development.
- **The whole list row was a delete button.** A single misclick destroyed a
  record with nothing indicating the row was destructive. Deletion is now an
  explicit, labelled control.
- **Averages were unweighted.** A 15 km trip and a 2 050 km trip counted equally
  toward a car's average consumption. It is distance-weighted now.
- **`NaN` was displayed** wherever a car had no reports; empty states render an
  em dash and an explanation.

### Changed

- **Build tooling: `react-scripts` 1.x → Vite 5.** Production build time went
  from ~60 s to under 5 s.
- **React 16 → 18**, Redux 3 + `react-router-redux` → Redux Toolkit +
  React Router 6, class components → function components and hooks.
- **Gzipped bundle: 1.5 MB → 484 kB.** `react-plotly.js` was pulling the full
  `plotly.js` build; it is bound to the basic bundle through its factory now.
- **Dependencies: 26 → 9** (1 902 → 375 installed packages). Removed
  `firebase`, `react-redux-firebase`, `@tensorflow/tfjs` (used only to generate
  random numbers for a chart), `jquery`, `lodash`, `react-router-bootstrap`,
  `plotly` and `react-plotly` (neither was ever imported; the actual chart
  library is `react-plotly.js`), `react-collapsible`, `react-dropdown`,
  `react-flip-move`, `reactstrap` and `rimraf`.
- **Form validation was reimplemented four times** across components, with the
  copies already diverged. It is one tested module now.
- **Curve sampling is deterministic and evenly spaced.** The prototype generated
  chart x-values with `tf.randomUniform` — roughly a megabyte of TensorFlow.js,
  plus a "WebGL is not supported" warning on every headless run — then sorted
  them. Extrapolation was also pulled in from 3× the largest sample to 1.2×,
  which had pushed a degree-2 fit into visible nonsense.
- **Routing uses a hash router** and the build uses a relative base, so the app
  works from a sub-path without server rewrites.

### Removed

- The Create React App boilerplate `README.md` (2 228 lines documenting
  `npm run eject`).
- The `/home` and `/fetch-data` pages, `Counter`, and the `WeatherForecasts`
  store — ASP.NET Core SPA template leftovers. `/fetch-data` called
  `api/SampleData/WeatherForecasts`, a backend that was not in this repository;
  it received `index.html` and threw on `response.json()`. `Counter` was routed
  nowhere and its reducer was never registered, so rendering it would have
  crashed.
- The hard-coded Firebase configuration block. See `SECURITY.md` for what this
  does and does not mean for the values still present in git history.
- The service worker, which cached an app that had nothing to cache.

[1.0.0]: https://github.com/konradcinkusz/CombustionReports/releases/tag/v1.0.0

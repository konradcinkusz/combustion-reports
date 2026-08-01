# Security Policy

## Reporting a vulnerability

Report privately through GitHub's
[security advisory form](https://github.com/konradcinkusz/CombustionReports/security/advisories/new).
Please do not open a public issue for a vulnerability.

Expect an acknowledgement within a week. This is a single-maintainer project — if
a fix will take longer than that, you will be told so rather than left waiting.

## Supported versions

The latest release only. There are no maintained back-branches.

## What CombustionReports handles

Very little, by design, and that is the main thing worth knowing:

- **Everything stays in the browser.** Cars, fuels and reports are written to
  `localStorage` under the key `combustion-reports/state`. There is no server,
  no account, no analytics and no network request after the page loads.
- **Nothing is encrypted.** `localStorage` is readable by any script running on
  the same origin and by anyone with access to the browser profile. The data is
  fuel figures, not secrets, but do not repurpose the store for anything
  sensitive.
- **There are no credentials in this repository.** Versions before 1.0 shipped a
  Firebase configuration block hard-coded in `src/store/configureStore.js`. That
  code has been removed and the app no longer talks to Firebase at all — but the
  values remain in the git history of commits up to `4f8f432`, as they must in
  any repository whose history is preserved.

  Those values were a Firebase *web* config: an API key of that kind is a public
  project identifier, not a secret, and Google documents it as safe to ship in
  client code. It is not, however, an access control. **If the
  `combustionreports` Firebase project still exists, confirm its Realtime
  Database security rules are not world-readable or world-writable before
  making this repository public** — publishing advertises the project id, and
  open rules would be exploitable regardless of where the key appears.

## Deployment notes

The build output is static files. Serving it needs no runtime, no environment
variables and no secrets. If you host it yourself, the usual static-site
hardening applies — HTTPS, and a `Content-Security-Policy` if you are strict
about it — but there is no server-side attack surface in this project to
configure.

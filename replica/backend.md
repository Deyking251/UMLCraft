# Crack UML backend status

Date: 2026-10-26

## Implemented M0/M1 backend slice

- `GET /api/health` reports the active backend mode without exposing secrets.
- Local development has a durable, atomic JSON project store under `.data/`.
- `GET /api/projects` lists projects and seeds the demo Library Planner project.
- `POST /api/projects` creates a validated project.
- `GET /api/projects/:projectId` reads a project.
- `PATCH /api/projects/:projectId` saves a full project with `baseRevision` conflict protection.
- `POST /api/projects/:projectId/validate` returns plain-language UML findings.
- `POST /api/auth/demo` creates a local-only HTTP-only demo session cookie.
- `scripts/migrate.mjs` applies the checked-in Postgres schema when `DATABASE_URL` is supplied.
- `scripts/seed-local.mjs` initializes the local development store.

The editor can use this local backend in development. The JSON adapter is intentionally a development bridge; production must use the Postgres schema and a real Auth.js session adapter.

## Security checklist

- [x] Secrets are represented only by `.env.example`; local data and env files are ignored.
- [x] Request model payloads are validated with Zod and bounded by schema limits.
- [x] Revision checks reject stale writes with `409 REVISION_CONFLICT`.
- [ ] Production authorization on every repository query: pending Postgres repository and Auth.js session wiring.
- [ ] Rate limits on auth and mutation routes: pending deployment boundary.
- [ ] Webhook signature verification: not applicable until Stripe is enabled.
- [ ] Upload size/type limits: no uploads in this slice.
- [x] Dependency audit: `npm audit --omit=dev` was run; two advisories remain in the pinned Next/PostCSS chain and require an intentional framework upgrade before deployment.
- [ ] Privacy policy processor inventory: required before public launch.

## Explicit boundary

No original app endpoints, OAuth clients, private APIs, branding assets, or copied implementation were used. No payment or third-party integration is enabled. The next backend pass should replace the local adapter with the normalized Postgres repository, add Auth.js, and add cross-workspace authorization tests.

# Crack UML

Crack UML is a clean-room, learner-oriented UML modeling studio. This first backend slice provides a durable local project store and a migration path to Postgres.

## Run locally

1. Copy `.env.example` to `.env.local` if you want to customize the local store.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The default development mode stores projects in `.data/projects.json`. The demo project is created on first read. `Save project` writes through the API and uses the browser cache only as an explicit fallback.

## Optional end-to-end tests

Install Playwright and Chromium in an environment with package/network access, then run the spec in `e2e/` against the local server:

```bash
npm install -D @playwright/test
npx playwright install chromium
npx playwright test
```

## Backend endpoints

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/demo`
- `PATCH /api/projects/demo` with `{ project, baseRevision }`
- `POST /api/projects/demo/elements`
- `POST /api/projects/demo/relationships`
- `POST /api/projects/demo/validate`

## Postgres preparation

Set `DATABASE_URL`, run `npm run db:migrate`, and replace the local adapter with the production Postgres/Auth.js repository before deployment. Never put live credentials in source control.

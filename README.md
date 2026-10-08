# Pizzaria ON

Online pizza ordering app with three roles: **customers** build and order pizzas, **employees** work the order queue, **admins** manage the catalog, users and sales reports.

UI text is in Brazilian Portuguese; code, API and database are in English.

## Team

- Bernado Martins Correa D'Abreu e Costa - [GitHub](https://github.com/Bentroen)
- Dayvison Augusto de Oliveira Da Costa - [GitHub](https://github.com/Dayv1son)
- Matheus Coelho - [GitHub](https://github.com/matheuslmc)
- Nicolas Vycas Nery - [GitHub](https://github.com/tomast1337)

Prototypes and design notes are in the GitHub wiki.

## Stack

| Layer    | Tech                                                                  |
| -------- | --------------------------------------------------------------------- |
| Frontend | Vite, React 19, TypeScript, Redux Toolkit (RTK Query), React Router 7 |
| Backend  | Node 22, Express 5, TypeScript, Kysely (query builder) on PostgreSQL  |
| Shared   | zod schemas and types in `packages/dtos`, used by both apps           |
| Dev      | npm workspaces, Docker Compose, Vitest, Prettier                      |

## Project layout

```
apps/backend     Express API (routes, services, repositories, migrations, seed)
apps/frontend    Vite + React app
packages/dtos    Shared zod schemas / DTO types (@pizzaria/dtos)
```

## Running with Docker (recommended)

Requires Docker with the Compose plugin.

```bash
cp .env.example .env     # set JWT_SECRET, adjust ports if they are taken
docker compose up --build
```

- Frontend: http://localhost:4517
- API: http://localhost:4518 (`GET /health`)
- Postgres: `localhost:54329`

On first start the backend runs the migrations and seeds an empty database. Source code is bind-mounted, so edits hot-reload.

Seed users (password `pizzaria123`, dev only):

| Role     | Email                     |
| -------- | ------------------------- |
| admin    | `admin@pizzaria.local`    |
| employee | `employee@pizzaria.local` |
| customer | `customer@pizzaria.local` |

Useful commands:

```bash
npm run docker:up       # same as docker compose up --build
npm run docker:down
npm run docker:reset    # wipe volumes (database, uploads) and start over
npm run docker:seed     # reset and re-seed a running database
docker compose down
docker volume ls -q | grep node_modules | xargs docker volume rm   # after changing any package.json
docker compose up --build
```

On macOS/Windows set `CHOKIDAR_USEPOLLING=1` in `.env` if the frontend does not hot-reload.

## Running without Docker

Requires Node 22+ and a PostgreSQL 14+ server.

```bash
cp .env.example .env     # point DATABASE_URL at your Postgres, set JWT_SECRET
npm ci
npm run db:seed -w @pizzaria/backend   # migrate + seed (skips if data exists)
npm run dev                            # API on :4518 and Vite on :4517
```

Generate a `JWT_SECRET` with:

```bash
node -e 'console.log(require("crypto").randomBytes(64).toString("hex"))'
```

## Scripts

| Command                                   | What it does                            |
| ----------------------------------------- | --------------------------------------- |
| `npm run dev`                             | API and frontend in watch mode          |
| `npm run typecheck`                       | `tsc --noEmit` in every workspace       |
| `npm test`                                | Vitest in every workspace               |
| `npm run e2e`                             | Cypress end-to-end suite                |
| `npm run build`                           | Typecheck + production build of the app |
| `npm run format`                          | Prettier                                |
| `npm run db:migrate -w @pizzaria/backend` | Apply pending migrations                |
| `npm run db:seed -w @pizzaria/backend`    | Migrate and seed an empty database      |
| `npm run db:reset -w @pizzaria/backend`   | Wipe data and seed again                |

## End-to-end tests (Cypress)

Specs live in `apps/e2e/cypress/e2e` and drive the real UI against a running stack: auth and role guards, the pizza builder, the full order lifecycle (customer → employee → report) and admin catalog/user management.

```bash
docker compose up -d                 # or `npm run dev` with a local Postgres
npm run e2e                          # headless
npm run e2e:open                     # interactive runner
npm run e2e:report                   # headless run + screenshot gallery
```

- **They wipe the database.** Each spec starts with `db:reset` (re-seed), which needs `DATABASE_URL` (root `.env`) to reach the same Postgres as the API from the host. Never point it at data you care about.
- If your ports differ from the defaults: `CYPRESS_BASE_URL=http://localhost:4527 CYPRESS_apiUrl=http://localhost:4518 npm run e2e`.
- On a machine without a display use `xvfb-run -a npm run e2e`.
- `npm run e2e:report` runs the suite in headless Chromium and writes `apps/e2e/cypress/report/index.html`: every test with its pass/fail state and the screenshots taken by `cy.snap("name")` (add one wherever a screen is worth seeing; failures get a screenshot automatically). `-- --spec <glob>` limits the run. The report is git-ignored.
- Specs log in through the API (`cy.visitAs(role, path)`) except the auth spec, which uses the form.

## API overview

All routes except `/auth/*` and `/health` need `Authorization: Bearer <token>`.

| Route                                                  | Role     |
| ------------------------------------------------------ | -------- |
| `POST /auth/login`, `POST /auth/register`              | public   |
| `GET /catalog/{ingredients,pizzas,products}`           | any user |
| `GET /customer/orders`, `POST /customer/orders`        | customer |
| `GET /employee/orders?status=`                         | employee |
| `POST /employee/orders/:id/start`, `.../complete`      | employee |
| `/admin/users`, `/admin/users/:id`, `PATCH .../role`   | admin    |
| `POST/PUT/DELETE /admin/{ingredients,pizzas,products}` | admin    |
| `GET /admin/reports?from=&to=`                         | admin    |

### Authentication

- Passwords are hashed with bcrypt (8 to 72 characters on register). Emails are trimmed and lower-cased.
- Login returns a short-lived access JWT (HS256, `JWT_EXPIRES_IN`, 15 minutes by default). The frontend keeps it **in memory only** and sends it as a Bearer token.
- Login also sets an **httpOnly refresh cookie** (`refresh_token`, scoped to `/auth`, `SameSite=Lax`, `Secure` with `COOKIE_SECURE=true`) that page scripts cannot read. On page load and whenever the API answers 401, the frontend trades it at `POST /auth/refresh` for a new access token, so a session lasts `REFRESH_TOKEN_DAYS` (7) without storing anything readable.
- Refresh tokens are random, stored only as a SHA-256 hash and **rotated** on every use. Replaying an already-used token revokes that whole login (theft detection); two tabs refreshing at the same moment are tolerated for `REFRESH_REUSE_GRACE_SECONDS`. `POST /auth/logout` revokes the login and clears the cookie.
- `/auth/refresh` and `/auth/logout` require an `X-Requested-By: pizzaria` header, which a cross-site form cannot send, on top of `SameSite` and the CORS origin list.
- CORS allows credentials only for the origins in `CORS_ORIGIN`. If the API and the site end up on different domains, serve both over HTTPS and set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.
- Failed logins and registrations are throttled per IP (`AUTH_RATE_LIMIT_MAX` per `AUTH_RATE_LIMIT_WINDOW_MINUTES`, then `429`). Successful ones don't count.
- Responses carry the usual security headers (helmet).

Order prices are always recomputed on the server. Order status flows `placed` → `in_progress` → `completed`.

## Database

Migrations live in `apps/backend/src/db/migrations` and are registered in `migrate.ts`; they run automatically when the API starts. Seed data (ingredients, pizzas, products) is in `apps/backend/src/db/seed-data.json`.

Images: seed images are served from `apps/backend/public/imgs` (`/imgs/...`); admin uploads are stored in `UPLOADS_DIR` (`/uploads/...`).

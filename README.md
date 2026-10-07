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

- Frontend: http://localhost:5173
- API: http://localhost:3001 (`GET /health`)
- Postgres: `localhost:5432`

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
docker compose up --build -V   # after changing any package.json
```

On macOS/Windows set `CHOKIDAR_USEPOLLING=1` in `.env` if the frontend does not hot-reload.

## Running without Docker

Requires Node 22+ and a PostgreSQL 14+ server.

```bash
cp .env.example .env     # point DATABASE_URL at your Postgres, set JWT_SECRET
npm ci
npm run db:seed -w @pizzaria/backend   # migrate + seed (skips if data exists)
npm run dev                            # API on :3001 and Vite on :5173
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
| `npm run build`                           | Typecheck + production build of the app |
| `npm run format`                          | Prettier                                |
| `npm run db:migrate -w @pizzaria/backend` | Apply pending migrations                |
| `npm run db:seed -w @pizzaria/backend`    | Migrate and seed an empty database      |
| `npm run db:reset -w @pizzaria/backend`   | Wipe data and seed again                |

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

Order prices are always recomputed on the server. Order status flows `placed` → `in_progress` → `completed`.

## Database

Migrations live in `apps/backend/src/db/migrations` and are registered in `migrate.ts`; they run automatically when the API starts. Seed data (ingredients, pizzas, products) is in `apps/backend/src/db/seed-data.json`.

Images: seed images are served from `apps/backend/public/imgs` (`/imgs/...`); admin uploads are stored in `UPLOADS_DIR` (`/uploads/...`).

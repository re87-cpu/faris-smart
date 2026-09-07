# فارس للمحاماة — faris-smart

Website and internal portals for **Faris Law Firm** (فارس للمحاماة): a public
Arabic (RTL) marketing site plus role-based staff and admin dashboards for
managing cases, sessions, documents, tasks, and articles.

## Tech stack

- **Frontend:** React 19, Vite 7, React Router, Framer Motion
- **Backend:** Express, Prisma ORM, PostgreSQL (`server/`)
- **Deployment:** Docker, Caddy (see `docker-compose.yml` and `server/`)
- **CI:** GitHub Actions — builds the API Docker image on push / PR to `main`
  (`.github/workflows/ci.yml`)

## Project layout

| Path                 | Purpose                                              |
| -------------------- | --------------------------------------------------- |
| `src/pages/`         | Public marketing pages and article views            |
| `src/pages/staff/`   | Staff portal (cases, calendar, tasks, notifications) |
| `src/pages/admin/`   | Admin portal (employees, analytics, assignments)    |
| `src/components/`    | Shared UI components                                 |
| `src/guards/`        | Route guards (`RequireStaff`, `RequireAdmin`)        |
| `src/store/`, `src/utils/` | Client-side data, auth, and API helpers        |
| `server/`            | Express + Prisma API                                 |

## Getting started

### Frontend

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # production build
npm run lint     # run ESLint
npm run preview  # preview the production build
```

### Backend (`server/`)

```bash
cd server
npm install
npm run prisma:gen   # generate the Prisma client
npm run dev          # start the API with --watch
```

Copy `server/.env.production.example` to a local `.env` and fill in the database
URL and secrets before running the API. The frontend expects its own `.env` at
the repo root (git-ignored).

# CourtSide — Tennis Court Booking

A React + Vite frontend and an Express + Postgres (Neon) backend, with
account auth via [Better Auth](https://www.better-auth.com). Built so the
whole thing ships as **one deployable artifact**: in production, a single
Express process serves the REST API, the auth endpoints, and the built
frontend static files. There's no separate frontend server to run or
deploy.

## Prerequisites

- Node.js 18+ (`node -v`, `npm -v`)
- A [Neon](https://neon.tech) Postgres project (free tier is fine), or any
  Postgres instance

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Neon connection string (Neon dashboard →
     Connection Details → pooled connection string, ends in
     `?sslmode=require`).
   - `BETTER_AUTH_SECRET` — generate one with
     `npx @better-auth/cli secret`.
   - `BETTER_AUTH_URL` — the public URL the app is served from
     (`http://localhost:3001` for local dev).

   ```bash
   cp .env.example .env
   ```

3. Create all tables and seed the mock courts, **in this order** (Better
   Auth's `user` table must exist before `bookings` can reference it):

   ```bash
   npm run migrate
   ```

   This runs `auth:migrate` (creates Better Auth's `user`, `session`,
   `account`, `verification` tables) followed by `db:migrate` (creates
   `courts`/`bookings` and seeds the court list from
   `src/data/mockCourts.js`). Both are safe to re-run.

## Run it locally (dev)

```bash
npm run dev
```

This runs two processes under one command (via `concurrently`): the Express
API on port 3001, and the Vite dev server (with hot reload) on port 5173,
which proxies `/api/*` (including `/api/auth/*`) to Express so session
cookies work the same as in production. Open http://localhost:5173.

## Run it as a single production artifact

```bash
npm run build   # builds the React app into dist/
npm start       # NODE_ENV=production node server/index.js
```

`npm start` runs **one Node process** that serves the REST API, auth
endpoints, and the built frontend, all on `PORT` (defaults to 3001).
That's the whole app — one process, one port, one thing to deploy
(Render, Railway, Fly.io, a single Docker container, a plain VM, etc.).
Set these environment variables on whatever platform you deploy to:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` — **must** be the app's real public HTTPS URL in
  production, not localhost.
- `PORT` (optional, most platforms set this for you)

## What you can test

- **Sign up / Sign in** (`/sign-up`, `/sign-in`) — email + password via
  Better Auth. Your name is what shows up on your bookings.
- **Find a Court** (`/`) — browsable without an account; courts loaded
  from Postgres via `GET /api/courts`.
- **Court detail** (`/courts/:id`) — anyone can see which slots are taken
  (`GET /api/bookings/availability`), but booking a slot requires signing
  in. Already-booked and past slots are disabled.
- **My Bookings** (`/bookings`, protected route) — only your own bookings
  (`GET /api/bookings/mine`), cancel via `DELETE /api/bookings/:id`
  (server checks you own it before deleting).

Double-booking is prevented at the database level with a unique constraint
on `(court_id, date_key, slot)`, so it's safe even under concurrent
requests.

## Project layout

```
src/            React frontend (Vite)
  api/client.js   fetch() wrapper around the backend
  lib/authClient.js  Better Auth React client (createAuthClient)
  context/        CourtsContext, BookingsContext ("my bookings")
  components/     SignIn, SignUp, ProtectedRoute, CourtDetail, MyBookings, ...
server/         Express backend
  index.js         app entry — mounts Better Auth, API routes, static serving
  auth.js          betterAuth() config (shares the pg pool with db.js)
  db.js            Postgres pool (Neon-compatible)
  middleware/requireAuth.js   Express middleware using auth.api.getSession()
  routes/          courts.js, bookings.js
  db/schema.sql    courts/bookings table definitions (references Better
                    Auth's "user" table)
  db/migrate.js    applies schema.sql and seeds courts
```

## Not built yet

- OAuth/social sign-in, email verification, password reset — Better Auth
  supports all of these; only email+password is wired up right now.
- Roles/admin — anyone with an account can book any open slot; there's no
  concept of a court admin or capacity limits beyond one booking per
  slot.

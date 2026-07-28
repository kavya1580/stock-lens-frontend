# Stock Lens

A React + TypeScript dashboard for researching Indian equities: fundamentals,
technical indicators, an AI-generated opinion with follow-up chat, news,
recent order-win announcements, and a results calendar — all backed by the
[`stock-lens-backend`](../stock-lens-backend) Spring Boot API.

For a deeper dive into the codebase, see:

- **`ARCHITECTURE.md`** — file map, API contract, hosting notes, known gotchas.
- **`FUNCTIONALITY.md`** — a feature-by-feature walkthrough of how each tab
  actually works under the hood.

## Stack

React 18 + TypeScript 5 + Vite 6 + MUI 6 + Recharts + react-markdown. No
router, no global state library — a single page with an in-memory tab index,
where each tab fetches its own data independently.

## Prerequisites

- Node.js 18+
- A running instance of [`stock-lens-backend`](../stock-lens-backend)
  (defaults to `http://localhost:8082`)

## Getting started

```bash
npm install
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`. Requests to
`/api/*` are proxied to `http://localhost:8082` (see `vite.config.ts`), so
make sure the backend is running there first.

If the backend is unreachable, the dashboard falls back to static demo data
for the main Fundamentals/Technical tabs (flagged with a "Demo data" chip) —
the app still renders, just with canned numbers instead of live ones.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with the `/api` proxy |
| `npm run build` | Type-check (`tsc -b`) and build a production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |

## Hosting

`npm run build` produces a static `dist/` folder — this app has no server of
its own. Before deploying, decide how it will reach the backend API:

- **Same origin (simplest):** put a reverse proxy (Nginx, etc.) in front of
  both, routing `/api/*` to the backend and everything else to `dist/`. No
  code changes needed.
- **Separate origins:** the frontend currently calls relative paths like
  `/api/stocks/...`, which only resolve correctly behind a proxy or on the
  same origin as the backend. Hosting them separately requires adding a
  configurable API base URL (e.g. a `VITE_API_BASE_URL` env var) and
  updating the backend's CORS allow-list to include the frontend's origin.

See `ARCHITECTURE.md` → "Hosting" for more detail.

## Project structure

```
src/
  components/   UI building blocks, grouped by feature (Fundamentals, Technical, AI, News, ...)
  pages/        Top-level page components composed from components/ (StockDashboard, OrderWins, ResultsCalendar)
  hooks/        useStock — fetch orchestration for the main dashboard bundle
  services/     stockApi.ts — the entire backend API contract layer
  data/         demoStock.ts — static fallback data
  types/        Shared TypeScript interfaces
  utils/        Formatting helpers
```

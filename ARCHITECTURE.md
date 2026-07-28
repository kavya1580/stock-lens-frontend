# Architecture Reference

Standing reference for this codebase so future work can read this file
instead of re-reading source across `src/`. Pairs with the backend's own
`ARCHITECTURE.md` at `stock-lens-backend/ARCHITECTURE.md` — read both when
working across the frontend/backend boundary. For a feature-by-feature
"how it actually works internally" narrative, see `FUNCTIONALITY.md`.

## Stack

React 18.3 + TypeScript 5.6 + Vite 6 + MUI 6 + Recharts 2.13 +
react-markdown 10. Single-page app, **no router** (no `react-router`
dependency) — one page (`StockDashboard`) with an in-memory tab index. No
shared state/cache library (no Redux/Zustand/React Query) — every
tab/component manages its own `useState`/`useEffect` fetch independently.

In local development, Vite's dev server proxies `/api` to
`http://localhost:8082` (`vite.config.ts`), so the app can call relative
paths like `/api/stocks/...` without a full base URL. **This proxy only
exists in `vite dev` — it is not part of the production build.** See
"Hosting" below.

## File Map

- **`App.tsx`** — root component. Owns theme mode (light/dark) and wires
  `useStock('RELIANCE')` to `AppHeader` (search + theme toggle) and
  `StockDashboard` (tab content).
- **`hooks/useStock.ts`** — fetch-orchestration state: `symbol`, `data`,
  `isLoading`, `error`, `loadStock(symbol)`. Calls `getStockBundle` on mount
  and on every search. `getStockBundle` never actually throws (it falls
  back to demo data on failure instead — see below), so this hook's
  `catch`/`error` path is effectively unreachable in practice today.
- **`services/stockApi.ts`** — the entire API contract layer:
  - `getJson<T>`/`postJson<T>` — thin `fetch` wrappers, throw on non-2xx.
  - `searchStocks(query)` → `GET /api/stocks/search` — backs the
    `StockSearch` autocomplete.
  - `transformFundamentals(raw)` — raw backend JSON → `CompanyFundamentals`.
  - `transformDerivedMetrics(raw)` — reads the backend's `derivedMetrics`
    flat object into the metric-grid shape components expect.
  - `transformScore(raw)` — raw backend JSON → `StockScore`, using
    `transformDerivedMetrics` above.
  - `transformIndicators(raw, range)` — zips the backend's parallel arrays
    (`bars[]`, `sma20[]`, `sma50[]`, `rsi14[]`, `macd.*[]`, `bollinger.*[]`,
    `avgVolume20[]`) into one flat `IndicatorPoint[]`. Also derives a
    `macdSignal` crossover label the backend doesn't send directly.
  - `getStockBundle(symbol)` — calls `/fundamentals/analysis` and
    `/indicators` in parallel via `Promise.all`, running the three
    transforms above; on **any** failure in either call, discards both and
    returns fully static demo data (`isDemo: true`) — see Known Gotchas.
  - `getAiAnalysis(symbol)` → `GET /ai-analysis`, `sendAiChatMessage(symbol,
    history, message)` → `POST /ai-chat`, `getStockNews(symbol)` →
    `GET /news` — no transform; the backend shape is assumed to match the
    TS type directly.
  - `getAwardWinningStocks(query)` → `GET /awards` — sends `pageNo` +
    `prevDate`/`toDate`/`search` on the wire (Order Wins, still BSE-backed).
  - `getUpcomingResults(query)` → `GET /results/upcoming` (sends only
    `pageNo` — the backend endpoint only accepts that param) /
    `getAnnouncedResults(query)` → `GET /results/announced` (sends `pageNo`
    and `lookbackDays`, which the backend clamps server-side to 1-2).
    Since the Screener.in migration (see backend `ARCHITECTURE.md`),
    `ResultsCalendarQuery` has no `prevDate`/`toDate`/`search` fields —
    it's a separate TS interface from `AwardWinningStocksQuery`. Defensive
    envelope-unwrapping helpers (`extractListItems`/`normalize*`) handle
    several possible response shapes.
- **`types/stock.ts`** — all TS interfaces (`CompanyFundamentals`,
  `StockScore`, `TechnicalIndicators`, `IndicatorPoint`, `AwardWinningStock`,
  `UpcomingResultStock`/`AnnouncedResultStock`, `AiAnalysis`,
  `AiChatMessage`, `StockNewsItem`, `StockBundle`, etc). This is the
  "intended" shape frontend components code against — not necessarily what
  the backend actually sends (see Known Gotchas).
- **`data/demoStock.ts`** — `demoFundamentals`/`demoIndicators`/`demoScore`,
  hand-built to match `types/stock.ts`'s main-bundle types. Used both as
  the offline fallback for `getStockBundle` and, implicitly, as the spec of
  what "correct" data should look like. **No demo data exists for AI
  Analysis, News, Results Calendar, or Order Wins** — those tabs call their
  own endpoints directly and show their own error state on failure, with
  no offline fallback.
- **`utils/format.ts`** — `currency`, `percent`, `getScoreTone`, `toneColor`.
- **`components/`**
  - `Header/AppHeader.tsx`, `Header/CompanyHeader.tsx` — top bar and
    company identity block (name, industry, price, demo-data chip).
  - `SearchBar/StockSearch.tsx` — an MUI `Autocomplete` (`freeSolo`) with a
    250ms debounce over `searchStocks()` (≥2 chars). Submits via Enter, the
    "Analyze" button, or picking a suggestion.
  - `Tabs/DashboardTabs.tsx` — **7 tabs**: Fundamentals, Technical Analysis,
    AI Analysis, Order Wins, Results Calendar, News, More. Only **More**
    is a placeholder — everything else, including Order Wins, is a fully
    implemented feature.
  - `Fundamentals/FundamentalsTab.tsx` — builds `Metric[]` groups manually
    from `fundamentals.*` flat fields (valuation/quality/growth/
    profitability/financialHealth/cashFlow), renders score breakdown,
    green/red flags (defensively handles both string and `{title,detail}`
    shapes), and `score.derivedMetrics` via `MetricGrid`.
  - `Technical/TechnicalTab.tsx` + `Charts/TechnicalCharts.tsx` — reads
    `indicators.candles: IndicatorPoint[]` and renders Price/RSI/MACD/Volume
    charts off it.
  - `Charts/ShareholdingTrend.tsx`, `Charts/ShareholdingBar.tsx` — merge
    4 independent quarterly series (`promoter/fii/dii/publicHoldingQuarterly`)
    into one chart-ready array by index/period.
  - `AI/AiAnalysisTab.tsx`, `AI/AiChatPanel.tsx`, `AI/MarkdownText.tsx` —
    manually-triggered (no auto-fetch) AI opinion via `getAiAnalysis`,
    rendered through a `react-markdown` wrapper; a stateless-on-the-backend
    chat panel below it that resends full history every message. See
    `FUNCTIONALITY.md` §5 for the full flow.
  - `News/NewsTab.tsx` — fetches on mount/symbol change via `getStockNews`,
    renders headline cards linking out to source articles.
  - `ResultsCalendar/AnnouncedResultItem.tsx`,
    `ResultsCalendar/UpcomingResultItem.tsx` +
    `pages/ResultsCalendar/ResultsCalendarPage.tsx` — Upcoming/announced
    toggle, client-side score sort, disclaimer tooltips on the
    "expected"/"vs trend" chips (the heuristic is self-referential, not
    analyst consensus — see backend `FUNCTIONALITY.md`). Defaults to the
    "Recently Announced" tab, since the backend has no forward-looking
    feed and always returns an empty page on Upcoming; that tab shows an
    explicit explanatory empty-state instead of a generic "no results"
    message. Announced mode has a "Lookback window" `ToggleButtonGroup`
    (Today only / Today + yesterday) wired to the `lookbackDays` param,
    which auto-refetches on change like the mode toggle does.
  - `OrderWins/AwardWinningStockItem.tsx`, `pages/OrderWins/OrderWinsPage.tsx`
    — table/card view over `getAwardWinningStocks`; sortable by score;
    rendered directly from `StockDashboard` (not wrapped in a
    "placeholder" component, despite living under `components/OrderWins`
    alongside the older `PlaceholderTabs.tsx`).
  - `Common/`, `Charts/ChartCard.tsx`, `ScoreCard/CircularScore.tsx` —
    presentational only, no API contract logic.
  - `Placeholders/PlaceholderTabs.tsx` — renders the "Upcoming Feature"
    grid for the **More** tab only. This is the last tab that's still a
    genuine placeholder.
- **`pages/StockDashboard/StockDashboard.tsx`** — tab-index state machine,
  renders `CompanyHeader` + active tab content, resets to tab 0 on symbol
  change.

## API Contract Consumed

| Frontend call | Backend endpoint | Notes |
|---|---|---|
| `getStockBundle` → fundamentals | `GET /api/stocks/{symbol}/fundamentals/analysis` | |
| `getStockBundle` → indicators | `GET /api/stocks/{symbol}/indicators?exchange=NSE&range=6mo` | Backend sends parallel arrays; zipped by `transformIndicators` |
| `searchStocks` | `GET /api/stocks/search?q=...` | Backs `StockSearch`'s Autocomplete |
| `getAwardWinningStocks` | `GET /api/stocks/awards` | Order Wins tab |
| `getUpcomingResults` | `GET /api/stocks/results/upcoming` | Backend (Screener.in-backed) always returns an empty page — tab shows an explanatory empty state |
| `getAnnouncedResults` | `GET /api/stocks/results/announced` | Default Results Calendar tab; wire params are `pageNo` + `lookbackDays` |
| `getAiAnalysis` | `GET /api/stocks/{symbol}/ai-analysis?exchange=NSE&range=6mo` | AI Analysis tab |
| `sendAiChatMessage` | `POST /api/stocks/{symbol}/ai-chat?exchange=NSE&range=6mo` | AI Chat panel |
| `getStockNews` | `GET /api/stocks/{symbol}/news` | News tab |
| *(none)* | `GET /api/stocks/{symbol}/overview` | Not called anywhere in the UI |
| *(none)* | `GET /api/stocks/{symbol}/fundamentals` (raw scrape) | Not called — frontend always uses the combined `/fundamentals/analysis` |
| *(none)* | `GET /api/stocks/{symbol}/score` | Not called — score always comes bundled via `/fundamentals/analysis` |

## Hosting

The frontend is a static Vite build (`npm run build` → `dist/`) with **no
server-side code of its own** — it's a pure client that talks to the
`stock-lens-backend` API. Two things to decide before deploying:

1. **Where API calls go.** Every call in `stockApi.ts` uses a relative
   path (`/api/stocks/...`). This works in dev only because of the Vite
   proxy above. In production there are two options:
   - Serve the built frontend and the backend behind the **same origin**
     (e.g. an Nginx/reverse-proxy in front of both, routing `/api/*` to the
     Spring Boot service and everything else to the static `dist/` files).
     No frontend code changes needed.
   - Host them on **separate origins** (e.g. a static host for the
     frontend, a separate service for the backend). In that case the
     relative paths in `stockApi.ts` need to be prefixed with a
     configurable base URL (e.g. a `VITE_API_BASE_URL` env var read via
     `import.meta.env`) — not implemented yet, since the actual hosting
     topology decides the right shape for this.
2. **CORS.** If the frontend and backend end up on different origins, the
   backend's CORS allow-list (`app.cors.allowed-origins` — see backend
   `ARCHITECTURE.md`) needs to include the frontend's deployed origin.

## Known Gotchas

- **All-or-nothing demo fallback.** `getStockBundle` wraps both API calls
  in a single `Promise.all`/try-catch — one failing call (e.g. a Yahoo
  Finance hiccup on `/indicators`) discards a fully-successful fundamentals
  fetch too, falling back to static demo data rather than showing partial
  real data with a narrower error.
- **`useStock`'s `error` state is effectively unreachable** in practice,
  for the same reason — the "Unable to load stock" error UI path is
  currently dead code, since `getStockBundle` never rethrows.
- **`ScoreBreakdownItem` (frontend) lacks `contributingMetrics`** present
  on the backend's `ScoreBreakdown` record. Not a runtime bug, simply
  unexposed/unused in the current UI.
- **AI Analysis / AI Chat / News / Results Calendar have no offline
  fallback.** Unlike the main dashboard bundle, these call their own
  endpoints directly with no demo-data path — if the backend (or Gemini,
  for AI features) is unavailable, the tab shows its own error state
  rather than degrading to canned content. This is by design; they're
  supplementary tabs, not the core demo-data-backed experience.
- Demo data (`data/demoStock.ts`) is the closest thing to a living spec of
  the *intended* shapes for the main bundle — useful for diffing against
  real captured backend JSON when investigating a rendering bug.
- No shared state/cache across tabs — every tab fetches independently on
  its own mount/effect, so switching tabs and back re-fetches from scratch
  in most cases (no React Query/SWR-style dedup or caching layer).

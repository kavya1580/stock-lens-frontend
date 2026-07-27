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
Dev server proxies `/api` to `http://localhost:8082` (`vite.config.ts`).

## File Map

- **`App.tsx`** — root component. Owns theme mode (light/dark) and wires
  `useStock('RELIANCE')` to `AppHeader` (search + theme toggle) and
  `StockDashboard` (tab content).
- **`hooks/useStock.ts`** — fetch-orchestration state: `symbol`, `data`,
  `isLoading`, `error`, `loadStock(symbol)`. Calls `getStockBundle` on mount
  and on every search. Note: `getStockBundle` never actually throws (see
  below), so this hook's `catch`/`error` path is effectively dead code today.
- **`services/stockApi.ts`** — the entire API contract layer (~645 lines,
  substantially grown since this doc was first written):
  - `getJson<T>`/`postJson<T>` — thin `fetch` wrappers, throw on non-2xx.
  - `searchStocks(query)` → `GET /search` — now actually wired to the UI
    (see `StockSearch` below; the old "unused" note no longer applies).
  - `transformFundamentals(raw)` — raw backend JSON → `CompanyFundamentals`,
    now including `dividendPayoutLatest`/`promoterPledge`, and correctly
    reading industry from `raw.sector` (previously read a non-existent
    top-level field — fixed).
  - `transformDerivedMetrics(raw)` — reads `derivedMetrics` as the flat
    object the backend actually sends (previously guarded with
    `Array.isArray()`, which was always false — fixed, see Fixed Issues).
  - `transformScore(raw)` — raw backend JSON → `StockScore`, using
    `transformDerivedMetrics` above.
  - `transformIndicators(raw, range)` — zips the backend's parallel arrays
    (`bars[]`, `sma20[]`, `sma50[]`, `rsi14[]`, `macd.*[]`, `bollinger.*[]`,
    `avgVolume20[]`) into one flat `IndicatorPoint[]` (previously passed
    through untransformed, which crashed the Technical tab — fixed, see
    Fixed Issues). Also derives a `macdSignal` crossover label the backend
    doesn't send directly.
  - `getStockBundle(symbol)` — calls `/fundamentals/analysis` and
    `/indicators` in parallel via `Promise.all`, running the three
    transforms above; on **any** failure in either call, discards both and
    returns 100% static demo data (`isDemo: true`) — still true, see Known
    Discrepancies.
  - `getAiAnalysis(symbol)` → `GET /ai-analysis`, `sendAiChatMessage(symbol,
    history, message)` → `POST /ai-chat`, `getStockNews(symbol)` →
    `GET /news` — all new, no transform (assume the backend shape matches
    the TS type directly).
  - `getAwardWinningStocks(query)` → `GET /awards` — sends `pageNo` +
    `prevDate`/`toDate`/`search` on the wire (Order Wins is unchanged,
    still BSE-backed via `BseAwardStockService`, and genuinely uses all
    four params).
  - `getUpcomingResults(query)` → `GET /results/upcoming` (sends only
    `pageNo` — the backend endpoint only accepts that param) /
    `getAnnouncedResults(query)` → `GET /results/announced` (sends `pageNo`
    and, since this doc was last updated, `lookbackDays` — the backend
    clamps this server-side to 1-2). **Since the Screener.in migration
    (see backend `ARCHITECTURE.md`), `ResultsCalendarQuery` no longer has
    `prevDate`/`toDate`/`search` fields at all** — it's a separate TS
    interface from `AwardWinningStocksQuery` (identical shape previously,
    now diverged), so this change didn't touch Order Wins. Defensive
    envelope-unwrapping helpers (`extractListItems`/`normalize*`) handle
    several possible response shapes.
  - Contains leftover debug `console.log`/`console.error` calls — noise,
    not wired to any UI.
- **`types/stock.ts`** — all TS interfaces (`CompanyFundamentals`,
  `StockScore`, `TechnicalIndicators`, `IndicatorPoint`, `AwardWinningStock`,
  `UpcomingResultStock`/`AnnouncedResultStock`, `AiAnalysis`,
  `AiChatMessage`, `StockNewsItem`, `StockBundle`, etc). This is the
  "intended" shape frontend components code against — not necessarily what
  the backend actually sends (see below).
- **`data/demoStock.ts`** — `demoFundamentals`/`demoIndicators`/`demoScore`,
  hand-built to match `types/stock.ts`'s main-bundle types (now including
  `dividendPayoutLatest`/`promoterPledge`). Used both as the offline
  fallback for `getStockBundle` and, implicitly, as the spec of what
  "correct" data should look like. **No demo data exists for AI Analysis,
  News, Results Calendar, or Order Wins** — those tabs call their own
  endpoints directly and show their own error state on failure, with no
  offline fallback.
- **`utils/format.ts`** — `currency`, `percent`, `getScoreTone`, `toneColor`.
- **`components/`**
  - `Header/AppHeader.tsx`, `Header/CompanyHeader.tsx` — top bar and
    company identity block (name, industry, price, demo-data chip).
  - `SearchBar/StockSearch.tsx` — an MUI `Autocomplete` (`freeSolo`) with a
    250ms debounce over `searchStocks()` (≥2 chars). Submits via Enter, the
    "Analyze" button, or picking a suggestion. **No longer a plain text
    field** — the old "no autocomplete" note is fixed, see Fixed Issues.
  - `Tabs/DashboardTabs.tsx` — **7 tabs**: Fundamentals, Technical Analysis,
    AI Analysis, Order Wins, Results Calendar, News, More. Only **More**
    remains a placeholder — everything else, including Order Wins, is a
    real implemented feature today.
  - `Fundamentals/FundamentalsTab.tsx` — builds `Metric[]` groups manually
    from `fundamentals.*` flat fields (valuation/quality/growth/
    profitability/financialHealth/cashFlow, now including
    `dividendPayoutLatest`/`promoterPledge`), renders score breakdown,
    green/red flags (defensively handles both string and `{title,detail}`
    shapes), and `score.derivedMetrics` via `MetricGrid` (now populated,
    see Fixed Issues).
  - `Technical/TechnicalTab.tsx` + `Charts/TechnicalCharts.tsx` — reads
    `indicators.candles: IndicatorPoint[]` (now correctly populated by
    `transformIndicators`) and renders Price/RSI/MACD/Volume charts off it.
  - `Charts/ShareholdingTrend.tsx`, `Charts/ShareholdingBar.tsx` — merge
    4 independent quarterly series (`promoter/fii/dii/publicHoldingQuarterly`)
    into one chart-ready array by index/period.
  - `AI/AiAnalysisTab.tsx`, `AI/AiChatPanel.tsx`, `AI/MarkdownText.tsx` —
    **new.** Manually-triggered (no auto-fetch) AI opinion via
    `getAiAnalysis`, rendered through a `react-markdown` wrapper; a
    stateless-on-the-backend chat panel below it that resends full
    history every message. See `FUNCTIONALITY.md` §5 for the full flow.
  - `News/NewsTab.tsx` — **new.** Fetches on mount/symbol change via
    `getStockNews`, renders headline cards linking out to source articles.
  - `ResultsCalendar/AnnouncedResultItem.tsx`,
    `ResultsCalendar/UpcomingResultItem.tsx` +
    `pages/ResultsCalendar/ResultsCalendarPage.tsx` — Upcoming/announced
    toggle, client-side score sort, disclaimer tooltips on the
    "expected"/"vs trend" chips (the heuristic is self-referential, not
    analyst consensus — see backend `FUNCTIONALITY.md`). **Updated for the
    Screener.in migration:** the page now defaults to the "Recently
    Announced" tab (Upcoming is dead — the backend has no forward-looking
    feed and always returns an empty page, per `ScreenerResultsCalendarService`'s
    own class Javadoc) and shows an explicit explanatory empty-state on
    Upcoming instead of a generic "no results" message. The old Prev
    Date/To Date/Search `TextField`s are removed (they were silently
    ignored by the backend); in their place, Announced mode has a
    "Lookback window" `ToggleButtonGroup` (Today only / Today + yesterday)
    wired to the real `lookbackDays` param, which auto-refetches on
    change like the mode toggle does.
  - `OrderWins/AwardWinningStockItem.tsx`, `pages/OrderWins/OrderWinsPage.tsx`
    — table/card view over `getAwardWinningStocks`; sortable by score;
    wire param is now correctly-cased `pageNo` (see Fixed Issues — the old
    pagination bug note no longer applies as-is).
  - `Common/`, `Charts/ChartCard.tsx`, `ScoreCard/CircularScore.tsx` —
    presentational only, no API contract logic.
  - `Placeholders/PlaceholderTabs.tsx` — **naming is now misleading**:
    `type === 'orders'` short-circuits straight to `<OrderWinsPage />`
    (a fully real feature), bypassing this component's own placeholder
    content entirely. Only `type === 'more'` still renders genuine
    "Upcoming Feature" placeholder cards.
- **`pages/StockDashboard/StockDashboard.tsx`** — tab-index state machine,
  renders `CompanyHeader` + active tab content, resets to tab 0 on symbol
  change.

## API Contract Consumed

| Frontend call | Backend endpoint | Status |
|---|---|---|
| `getStockBundle` → fundamentals | `GET /api/stocks/{symbol}/fundamentals/analysis` | Consumed, correct |
| `getStockBundle` → indicators | `GET /api/stocks/{symbol}/indicators?exchange=NSE&range=6mo` | Consumed, shape mismatch **fixed** via `transformIndicators` |
| `searchStocks` | `GET /api/stocks/search?q=...` | Consumed — wired to `StockSearch`'s Autocomplete (previously unused) |
| `getAwardWinningStocks` | `GET /api/stocks/awards` | Consumed — wire param now correctly-cased `pageNo` |
| `getUpcomingResults` | `GET /api/stocks/results/upcoming` | Consumed, but backend (Screener.in-backed since the migration) always returns an empty page — tab shows an explanatory empty state, no longer the default tab |
| `getAnnouncedResults` | `GET /api/stocks/results/announced` | Consumed (default Results Calendar tab); wire params now `pageNo` + `lookbackDays` only |
| `getAiAnalysis` | `GET /api/stocks/{symbol}/ai-analysis?exchange=NSE&range=6mo` | Consumed (AI Analysis tab) |
| `sendAiChatMessage` | `POST /api/stocks/{symbol}/ai-chat?exchange=NSE&range=6mo` | Consumed (AI Chat panel) |
| `getStockNews` | `GET /api/stocks/{symbol}/news` | Consumed (News tab) |
| *(none)* | `GET /api/stocks/{symbol}/overview` | Not called anywhere in the UI |
| *(none)* | `GET /api/stocks/{symbol}/fundamentals` (raw scrape) | Not called — frontend always uses the combined `/fundamentals/analysis` |
| *(none)* | `GET /api/stocks/{symbol}/score` | Not called — score always comes bundled via `/fundamentals/analysis` |

## Fixed Since Last Review

The previous version of this doc listed 6 discrepancies against the
backend contract. Re-checked against current source — all 6 now appear
resolved:

1. **Technical Analysis tab crash (was Critical).** `transformIndicators(raw,
   range)` now exists in `stockApi.ts` and zips the backend's parallel
   arrays (`bars`, `sma20/sma50/ema20/rsi14`, `macd.*`, `bollinger.*`,
   `avgVolume20`) into the flat `IndicatorPoint[]` the Technical tab
   expects, plus maps `latest` into the summary object. No longer crashes.
2. **"Derived Metrics" always empty (was High).** `transformDerivedMetrics(raw)`
   now reads `derivedMetrics` as the flat object/map the backend actually
   sends (the code's own comment explicitly notes this), replacing the old
   `Array.isArray()` guard that was always false. `MetricGrid` now
   populates.
3. **Order Wins pagination (was High).** `getAwardWinningStocks` now sends
   `pageNo` (capital N) as the wire query param, matching what the
   backend's `@RequestParam int pageNo` binds to. (The local
   `AwardWinningStocksQuery.pageno` TS field is still lowercase, but that's
   only an internal variable name — it doesn't affect the actual request.)
4. **`industry` always "N/A" (was Medium).** `extractIndustry` now reads
   `raw.sector`, matching the adjacent (already-correct) `extractSector`
   call.
5. **Payout/pledge fields dropped (was Low).** `CompanyFundamentals`/
   `transformFundamentals` now include `dividendPayoutLatest` and
   `promoterPledge`, and `FundamentalsTab` renders both.
6. **`/api/stocks/search` unused (was Low/design).** `StockSearch.tsx` is
   now an MUI `Autocomplete` wired to `searchStocks()` with a 250ms
   debounce.

**Still open / unchanged:**

- **All-or-nothing demo fallback.** `getStockBundle` still wraps both API
  calls in a single `Promise.all`/try-catch — one failing call (e.g. a
  Yahoo Finance hiccup on `/indicators`) still discards a fully-successful
  fundamentals fetch too, falling back to static demo data rather than
  showing partial real data with a narrower error.
- **`useStock`'s `error` state is still effectively unreachable** in
  practice, for the same reason — the "Unable to load stock" error UI path
  remains dead code today.
- **`ScoreBreakdownItem` (frontend) still lacks `contributingMetrics`**
  present on the backend's `ScoreBreakdown` record. Not a runtime bug,
  simply unexposed/unused in the current UI.

## New Discrepancies / Gaps (features added since last review)

1. **AI Analysis / AI Chat have no offline fallback.** Unlike the main
   dashboard bundle, `getAiAnalysis`/`sendAiChatMessage` have no demo-data
   path — if the backend or Gemini itself is unavailable, the tab shows its
   own error state rather than degrading to canned content.
2. **News and Results Calendar likewise have no offline fallback** — same
   pattern as above, by design (these are supplementary tabs, not the core
   demo-data-backed experience).
3. **Order Wins is routed through a component still named `PlaceholderTab`.**
   `Placeholders/PlaceholderTabs.tsx`'s `type === 'orders'` branch
   short-circuits directly to `<OrderWinsPage />`, bypassing the
   component's own placeholder-card content — functionally correct, but an
   organizational/naming inconsistency worth cleaning up (e.g. rendering
   `OrderWinsPage` directly from `DashboardTabs` instead of through
   `PlaceholderTab`).
4. **"P" default search filter on Order Wins only (was: "and Results
   Calendar").** Order Wins still defaults its `search` filter field to the
   literal string `"P"`, which looks like a leftover dev/test default
   rather than an intentional "no filter" value, and does affect what's
   shown on first load. **Results Calendar's equivalent field no longer
   exists** — it was removed as part of the Screener.in migration cleanup
   (see item 6 below), since the backend endpoints never actually honored
   `search`/`prevDate`/`toDate` in the first place.
5. **`AwardWinningStocksQuery.pageno` naming inconsistency.** The TS
   interface field is lowercase while the actual wire parameter sent is
   `pageNo` — cosmetic, but worth renaming for consistency now that the
   underlying bug it was tangled up with is fixed.
6. **(Resolved this pass) Results Calendar's dead date/search fields and
   always-empty default tab.** Previously, `ResultsCalendarPage.tsx` sent
   `prevDate`/`toDate`/`search` to endpoints that silently ignored them
   (Spring MVC doesn't error on unbound extra params), and defaulted to
   the "Upcoming" tab, which the Screener.in-backed endpoint always
   returns empty. Fixed: the dead fields are removed, the default tab is
   now "Recently Announced", and a real "Lookback window" control
   (1-2 days) is wired to the backend's `lookbackDays` param.

## Known Gotchas

- `useStock`'s `error` state is effectively unreachable in practice, since
  `getStockBundle` catches all failures internally and returns demo data
  instead of rethrowing — the "Unable to load stock" error UI path is
  currently dead code.
- Demo data (`data/demoStock.ts`) is the closest thing to a living spec of
  the *intended* shapes for the main bundle — useful for diffing against
  real captured backend JSON when investigating a rendering bug. It has no
  equivalent for AI Analysis/News/Results Calendar/Order Wins.
- No shared state/cache across tabs — every tab fetches independently on
  its own mount/effect, so switching tabs and back re-fetches from scratch
  in most cases (no React Query/SWR-style dedup or caching layer).

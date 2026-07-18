# Architecture Reference

Standing reference for this codebase so future work can read this file
instead of re-reading source across `src/`. Pairs with the backend's own
`ARCHITECTURE.md` at `stock-lens-backend/ARCHITECTURE.md` — read both when
working across the frontend/backend boundary.

## Stack

React 18.3 + TypeScript 5.6 + Vite 6 + MUI 6 + Recharts 2.13. Single-page
app, no router — one page (`StockDashboard`) with an in-memory tab index.

## File Map

- **`App.tsx`** — root component. Owns theme mode (light/dark) and wires
  `useStock('RELIANCE')` to `AppHeader` (search + theme toggle) and
  `StockDashboard` (tab content).
- **`hooks/useStock.ts`** — fetch-orchestration state: `symbol`, `data`,
  `isLoading`, `error`, `loadStock(symbol)`. Calls `getStockBundle` on mount
  and on every search. Note: `getStockBundle` never actually throws (see
  below), so this hook's `catch`/`error` path is effectively dead code today.
- **`services/stockApi.ts`** — the entire API contract layer:
  - `getJson<T>(path)` — thin `fetch` wrapper, throws on non-2xx.
  - `transformFundamentals(raw)` — raw backend JSON → `CompanyFundamentals`.
  - `transformScore(raw)` — raw backend JSON → `StockScore`.
  - `getStockBundle(symbol)` — calls `/fundamentals/analysis` and
    `/indicators` in parallel via `Promise.all`; on **any** failure in
    either call, discards both and returns 100% static demo data
    (`isDemo: true`). Indicators are passed through **untransformed**
    (`const indicators = indicatorsRaw`) — see Known Discrepancies #1.
  - `getAwardWinningStocks(query)` — builds query params for `/awards`.
- **`types/stock.ts`** — all TS interfaces (`CompanyFundamentals`,
  `StockScore`, `TechnicalIndicators`, `IndicatorPoint`, `AwardWinningStock`,
  `StockBundle`, etc). This is the "intended" shape frontend components code
  against — not necessarily what the backend actually sends (see below).
- **`data/demoStock.ts`** — `demoFundamentals`/`demoIndicators`/`demoScore`,
  hand-built to match `types/stock.ts` exactly. Used both as the offline
  fallback and, implicitly, as the spec of what "correct" data should look
  like — useful for diffing against real backend responses.
- **`utils/format.ts`** — `currency`, `percent`, `getScoreTone`, `toneColor`.
- **`components/`**
  - `Header/AppHeader.tsx`, `Header/CompanyHeader.tsx` — top bar and
    company identity block (name, industry, price, demo-data chip).
  - `SearchBar/StockSearch.tsx` — plain controlled text field; submits the
    typed value directly as the stock symbol. No autocomplete — the
    backend's `/api/stocks/search` endpoint is not called anywhere in the UI.
  - `Tabs/DashboardTabs.tsx` — 5 tabs: Fundamentals, Technical Analysis,
    AI Analysis, Order Wins, More. Only the first two are implemented;
    the rest render `PlaceholderTab`.
  - `Fundamentals/FundamentalsTab.tsx` — builds `Metric[]` groups manually
    from `fundamentals.*` flat fields (valuation/quality/growth/
    profitability/financialHealth/cashFlow), renders score breakdown,
    green/red flags (defensively handles both string and `{title,detail}`
    shapes), and `score.derivedMetrics` via `MetricGrid`.
  - `Technical/TechnicalTab.tsx` + `Charts/TechnicalCharts.tsx` — reads
    `indicators.candles: IndicatorPoint[]` directly (one flat array with
    `sma20/sma50/ema20/rsi/macd/signal/histogram/bollingerUpper/...` merged
    per-candle) and renders Price/RSI/MACD/Volume charts off it.
  - `Charts/ShareholdingTrend.tsx`, `Charts/ShareholdingBar.tsx` — merge
    4 independent quarterly series (`promoter/fii/dii/publicHoldingQuarterly`)
    into one chart-ready array by index/period.
  - `OrderWins/AwardWinningStockItem.tsx`, `pages/OrderWins/OrderWinsPage.tsx`
    — table/card view over `getAwardWinningStocks`; local `pageno` filter
    state (lowercase — see Known Discrepancies #3).
  - `Common/`, `Charts/ChartCard.tsx`, `ScoreCard/CircularScore.tsx`,
    `Placeholders/PlaceholderTabs.tsx` — presentational only, no API
    contract logic.
- **`pages/StockDashboard/StockDashboard.tsx`** — tab-index state machine,
  renders `CompanyHeader` + active tab content, resets to tab 0 on symbol
  change.

## API Contract Consumed

| Frontend call | Backend endpoint | Status |
|---|---|---|
| `getStockBundle` → fundamentals | `GET /api/stocks/{symbol}/fundamentals/analysis` | Consumed, mostly correct (see gaps below) |
| `getStockBundle` → indicators | `GET /api/stocks/{symbol}/indicators?exchange=NSE&range=6mo` | Consumed but **shape mismatch**, untransformed (Critical #1) |
| `getAwardWinningStocks` | `GET /api/stocks/awards` | Consumed, pagination broken (#3) |
| *(none)* | `GET /api/stocks/search` | Not called anywhere in the UI |
| *(none)* | `GET /api/stocks/{symbol}/overview` | Not called anywhere in the UI |
| *(none)* | `GET /api/stocks/{symbol}/fundamentals` (raw scrape) | Not called — frontend always uses the combined `/fundamentals/analysis` |
| *(none)* | `GET /api/stocks/{symbol}/score` | Not called — score always comes bundled via `/fundamentals/analysis` |

## Known Discrepancies vs. Backend

Ranked by severity. Backend types referenced here live in
`stock-lens-backend/src/main/java/com/stockdashboard/dto/`.

1. **[Critical] Technical Analysis tab crashes on real (non-demo) data.**
   Backend's `StockIndicatorResponse` has no `candles` field — it returns
   `bars: List<OhlcvBar>` plus *parallel* arrays: `sma20/sma50/ema20/rsi14:
   List<Double>`, `macd: MacdResult {macdLine, signalLine, histogram}`,
   `bollinger: BollingerResult {upper, middle, lower}`, `avgVolume20`,
   `latest: LatestSnapshot`. `stockApi.ts`'s `getStockBundle` passes this
   straight through untransformed (`const indicators = indicatorsRaw`), so
   `data.indicators.candles` is `undefined` against real data.
   `TechnicalTab.tsx:13` — `indicators.candles[indicators.candles.length - 1]`
   — throws immediately. No `ErrorBoundary` exists anywhere in the app, so
   this white-screens the whole page when a user opens the "Technical
   Analysis" tab. **Fix**: write a `transformIndicators(raw)` (parallel to
   `transformFundamentals`/`transformScore`) that zips `bars[i]` with
   `sma20[i]`, `sma50[i]`, `ema20[i]`, `rsi14[i]`, `macd.macdLine[i]`,
   `macd.signalLine[i]`, `macd.histogram[i]`, `bollinger.upper[i]`,
   `bollinger.middle[i]`, `bollinger.lower[i]`, `avgVolume20[i]` into one
   flat `IndicatorPoint` per index, plus map `latest` → the 4-string summary
   object the type already expects.

2. **[High] "Derived Metrics" section always renders empty.**
   Backend's `FundamentalScoreResponse.derivedMetrics` is `Map<String,
   Object>` (confirmed by the DTO and a live captured response), not a list.
   `transformScore`'s `Array.isArray(raw.derivedMetrics)` guard is always
   `false` against real data, so it silently becomes `[]` and
   `FundamentalsTab`'s `MetricGrid` for it never shows anything.

3. **[High] Order Wins pagination silently ignored server-side.**
   Frontend (`OrderWinsPage`, `getAwardWinningStocks`) sends the query
   param as `pageno` (lowercase). Backend's controller declares
   `@RequestParam(defaultValue = "1") int pageNo` (capital N) with no
   explicit `name=` override — Spring binds by exact parameter-name case,
   so the mismatch means the real page number is never bound and the
   backend always serves page 1 of the BSE feed, regardless of what page
   the UI thinks it's requesting.

4. **[Medium] `industry` field always shows "N/A".**
   `transformFundamentals` calls `extractIndustry(raw.industry)`, but the
   backend never sends a top-level `industry` key — it's nested at
   `raw.sector.industry` / `raw.sector.broadIndustry` (see
   `FundamentalsResponse.SectorInfo`). Should be `extractIndustry(raw.sector)`,
   exactly like the adjacent (correct) `extractSector(raw.sector)` call.

5. **[Low] New payout/pledge fields aren't surfaced.**
   Backend's `FundamentalsResponse` now includes `dividendPayoutLatest`,
   `dividendPayoutSeries`, `promoterPledge` (added to back the
   `long-term-investing-analysis` skill's rubric — see backend
   `ARCHITECTURE.md`). `CompanyFundamentals`/`transformFundamentals` have no
   equivalent fields, so this data is silently dropped even though it's now
   scored and red-flagged server-side.

6. **[Low, design] `/api/stocks/search` is unused.** No autocomplete/
   suggestion UI calls it; `StockSearch.tsx` submits raw typed text as the
   symbol directly.

7. **[Design note] All-or-nothing demo fallback.** `getStockBundle` wraps
   both API calls in a single `Promise.all`/`try-catch` — one failing call
   (e.g. a Yahoo Finance hiccup on `/indicators`) discards a fully-successful
   fundamentals fetch too, and the whole page falls back to static demo
   data rather than showing partial real data with a narrower error.

8. **[Cosmetic] `ScoreBreakdownItem` (frontend) is missing `contributingMetrics`**
   present on backend's `ScoreBreakdown` record (`Map<String, Object>`).
   Not a runtime bug — simply unexposed/unused in the current UI.

## Known Gotchas

- `useStock`'s `error` state is effectively unreachable in practice, since
  `getStockBundle` catches all failures internally and returns demo data
  instead of rethrowing — the "Unable to load stock" error UI path is
  currently dead code.
- Demo data (`data/demoStock.ts`) is the closest thing to a living spec of
  the *intended* shapes — useful for diffing against real captured backend
  JSON when investigating a rendering bug, per the discrepancies above.

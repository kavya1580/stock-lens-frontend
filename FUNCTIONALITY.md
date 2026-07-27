# Frontend Functionality — Behind the Scenes

This doc walks through every feature in the dashboard and explains the
actual mechanics behind it: what triggers a fetch, how the response is
transformed, and where the rough edges are. Pairs with `ARCHITECTURE.md`
(file map, API contract table) — this file is the narrative "how it really
works" companion. Single-page app, no router (confirmed — no
`react-router` dependency), one symbol loaded at a time via `useStock`.

The dashboard has **7 tabs**; only "More" is still a placeholder. Every
other tab — including Order Wins — is a real, wired feature today.

## 1. Search — `SearchBar/StockSearch.tsx`

**What it does:** an autocomplete text box for jumping to a different
stock symbol.

**Behind the scenes:**
- It's an MUI `Autocomplete` in `freeSolo` mode, not a plain text field.
  As you type, once you've entered ≥2 characters it debounces 250ms and
  calls `searchStocks(query)` → `GET /api/stocks/search?q=...`, rendering
  each hit as `symbol` + `name`.
- Submitting works three ways: pressing Enter, clicking "Analyze", or
  picking a suggestion from the dropdown — all three end up calling the
  same `onSearch(trimmed.toUpperCase())`, which is `loadStock` from
  `useStock`.
- Selecting a stock re-triggers `App.tsx`'s single `useStock` hook, which
  resets `StockDashboard`'s active tab back to 0 (Fundamentals) on symbol
  change.

## 2. Data loading — `hooks/useStock.ts` + `services/stockApi.ts`

**What it does:** the orchestration layer underlying the whole dashboard —
one call fetches fundamentals, score, and technicals together for the
active symbol.

**Behind the scenes:**
- `getStockBundle(symbol)` fires `GET /fundamentals/analysis` and
  `GET /indicators?exchange=NSE&range=6mo` **in parallel** via
  `Promise.all`, then runs three transform functions before handing data
  to components:
  - `transformFundamentals(raw)` — flattens the ~70-field scrape response
    into the `CompanyFundamentals` shape components expect, including the
    now-mapped `dividendPayoutLatest` and `promoterPledge` fields, and
    correctly reads `industry`/`sector` from the same nested `raw.sector`
    object (an earlier version read a non-existent top-level `industry`
    field and always showed "N/A" — that's fixed).
  - `transformScore(raw)` — flattens the score response, including
    `transformDerivedMetrics(raw.derivedMetrics)`, which reads the
    backend's `derivedMetrics` as the **flat object/map it actually is**
    (an earlier version guarded with `Array.isArray()`, which was always
    false against real data, so this section silently rendered empty —
    also fixed now).
  - `transformIndicators(raw, range)` — the backend returns *parallel
    arrays* (`bars[]`, `sma20[]`, `sma50[]`, `rsi14[]`, `macd.macdLine[]`,
    `bollinger.upper[]`, etc.), not one array of candle objects. This
    function zips them together by index into one flat `IndicatorPoint[]`
    that the chart components can actually consume directly. (An earlier
    version passed the raw parallel-array shape straight through, and the
    Technical tab crashed the whole page reading `indicators.candles`,
    which didn't exist — also fixed now.) It also derives a `macdSignal`
    label (Bullish/Bearish Crossover) that the backend doesn't send
    directly, by comparing the latest MACD line vs. signal line.
- **All-or-nothing demo fallback**: if *either* of the two parallel calls
  throws for any reason, `getStockBundle` discards both results and
  returns fully static demo data (`data/demoStock.ts`) with `isDemo: true`
  — there's no partial-success path (e.g. showing real fundamentals with a
  technicals error banner). `CompanyHeader` shows a "Demo data fallback"
  chip when this happens.
- Because `getStockBundle` never actually rethrows, `useStock`'s `error`
  state and `StockDashboard`'s `ErrorState` UI are effectively unreachable
  in normal operation today — worth knowing if you're debugging why an
  error banner never appears even when a real backend call is failing
  (it's silently becoming demo data instead).
- Contains several leftover `console.log`/`console.error` debug lines
  (`"🔄 Fetching stock data for:"` etc.) — noise, not wired to any UI.

## 3. Fundamentals tab — `Fundamentals/FundamentalsTab.tsx`

**What it does:** valuation/growth/profitability/financial-health/cash-flow
metric groups, pros/cons, shareholding charts, and the score breakdown.

**Behind the scenes:**
- Metric groups (Valuation, Quality, Growth, Profitability, Financial
  Health, Cash Flow) are built manually in this component from flat
  `fundamentals.*` string fields — there's no generic schema-driven
  renderer, each group is a hardcoded list of which fields go where. The
  newly-surfaced `dividendPayoutLatest` lives in Valuation and
  `promoterPledge` in Financial Health.
- Pros/Cons defensively handle both a plain string and a
  `{title, detail}` object shape per item, since the backend's scraped
  `cons[]` items are simple strings while some score-derived flags carry
  structure.
- Shareholding: `ShareholdingBar` renders the current promoter/FII/DII/
  public split; `ShareholdingTrend` merges four independent quarterly
  series (promoter/fii/dii/public) into one chart-ready array by matching
  them up by period index.
- Score section: `CircularScore` (the 0–100 dial), per-category
  `LinearProgress` breakdown cards, red/green flag chips, and a
  `MetricGrid` over `score.derivedMetrics` — which now actually populates
  data since the `transformDerivedMetrics` fix above.

## 4. Technical Analysis tab — `Technical/TechnicalTab.tsx` + `Charts/TechnicalCharts.tsx`

**What it does:** price chart with moving averages/Bollinger Bands, RSI,
MACD, and volume, plus a 5-card summary strip (Price/Trend/RSI/MACD/Volume).

**Behind the scenes:**
- Reads `indicators.candles` (the flattened array from `transformIndicators`,
  see above) and `indicators.latest` for the summary cards. Each summary
  card's color/tone comes from a lookup table (`TREND_TONE`, `RSI_TONE`,
  `MACD_TONE`, `VOLUME_TONE`) keyed off the backend's plain-English signal
  strings (Bullish/Bearish/Overbought/etc.).
- `PriceChart`: a composed Recharts bar+line chart — daily high/close bars
  colored green/red by up/down day, with SMA20/SMA50/EMA20/Bollinger bands
  overlaid as lines.
- `RsiChart`: line chart with fixed 70/30 reference lines.
- `MacdChart`: histogram bars plus MACD/signal lines.
- `VolumeChart`: volume bars plus a 20-day average-volume line.
- If there's no candle data (e.g. a very new listing), it shows "Not
  enough historical data to chart yet" instead of an empty chart.

## 5. AI Analysis tab — `AI/AiAnalysisTab.tsx` + `AI/AiChatPanel.tsx` + `AI/MarkdownText.tsx`

**What it does:** an on-demand AI-generated opinion on the stock, plus a
free-form follow-up chat grounded in the same data.

**Behind the scenes:**
- **Nothing auto-fetches.** Switching to this tab shows a "Generate AI
  Analysis" button; only clicking it calls `getAiAnalysis(symbol)` →
  `GET /ai-analysis`. This is a single non-streamed request — there's no
  token-by-token rendering, just a loading spinner until the full JSON
  response arrives.
- The response renders as a color-coded verdict chip (green if the verdict
  text contains "bull", red for "bear", yellow for "caution" — plain
  substring matching, not an enum) plus 5 cards (overall opinion, business
  quality, risks, competitive advantage, earnings summary), each rendered
  through `MarkdownText` (a thin `react-markdown` wrapper mapping
  paragraphs/lists/links to MUI components — no GFM plugin configured, so
  tables/strikethrough in the AI's response won't render, only basic
  markdown).
- Once generated, the button becomes "Regenerate," re-running the same
  call (the backend independently caches this for 12h server-side, so
  rapid regeneration for the same symbol returns the same cached opinion).
- **AI Chat is independent of AI Analysis** — it's always rendered below,
  whether or not you've generated an analysis. It keeps its own
  `messages` list in component state (`{role: 'user'|'model', content}`).
  Sending a message: the message is optimistically appended to the local
  list, the *prior* messages (before this new one) are sent as `history`,
  and the new message is sent separately as `message` to
  `POST /ai-chat`. The reply is appended once it comes back.
- **The backend has no memory of its own** — this component's local
  `messages` array *is* the entire conversation state. Refreshing the page
  or switching tabs and back resets it to empty; every send resends the
  full history from scratch.
- Enter submits (Shift+Enter for a newline); auto-scrolls to the bottom on
  new messages.

## 6. News tab — `News/NewsTab.tsx`

**What it does:** up to 20 recent headlines about the company, sourced via
Google News.

**Behind the scenes:**
- Fetches on mount and on every symbol change via `getStockNews(symbol)` →
  `GET /news`. Uses a `cancelled` flag inside the effect to avoid setting
  state after the component's unmounted or the symbol's already changed
  again (guards against a slow response for the *previous* symbol
  clobbering the *new* symbol's UI).
- Each item renders as a card with an external link (opens in a new tab),
  a source chip, and a formatted publish date (falls back to the raw
  string if `Date` can't parse it).
- No demo/offline fallback exists for this tab specifically — if the
  backend call fails, it shows its own error state rather than any
  placeholder headlines.

## 7. Results Calendar tab — `pages/ResultsCalendar/ResultsCalendarPage.tsx`

**What it does:** two sub-views — an "Upcoming" tab and a "Recently
Announced" tab — with a self-referential "expected trend" /
"beat-or-below trend" indicator on each row. Since the backend's
Screener.in migration (see backend `FUNCTIONALITY.md` §6), the Upcoming
tab has no live data source and always returns empty; the page defaults
to Recently Announced accordingly.

**Behind the scenes:**
- A `ToggleButtonGroup` switches `mode` between `'upcoming'`/`'announced'`,
  which re-fetches automatically (`useEffect` on `mode`) via
  `getUpcomingResults`/`getAnnouncedResults`. **Defaults to `'announced'`**
  (changed from `'upcoming'` — Upcoming is a dead end, see below).
- The page no longer sends `prevDate`/`toDate`/`search` at all — those
  fields were removed from the UI (and from `ResultsCalendarQuery`) because
  the backend's `/results/upcoming` and `/results/announced` endpoints
  never bound them to anything; they were silently swallowed as unbound
  Spring MVC request params.
- In their place, Announced mode has a "Lookback window" `ToggleButtonGroup`
  (Today only / Today + yesterday) that sends the real `lookbackDays`
  param the backend actually understands (clamped server-side to 1-2).
  Like the mode toggle, changing it re-fetches immediately rather than
  waiting for an explicit Fetch click.
- Selecting Upcoming shows an explicit empty-state explanation ("Screener.in
  doesn't provide a forward-looking results calendar...") instead of the
  generic "no results" message, since this tab is never going to populate
  under the current backend.
- A `requestIdRef` counter discards stale responses — if you switch modes
  or refetch quickly, an older in-flight request's response is thrown away
  if a newer request has since been issued, preventing a slow response
  from clobbering a fresher one.
- Whatever page of results comes back is **re-sorted client-side**,
  descending by fundamental score (missing/non-numeric scores sink to the
  bottom) — this is a client-side re-sort of one page of data, not a
  server-side global sort across all pages.
- Renders as an MUI `Table` on desktop, stacked cards on mobile — same
  underlying data, two layouts (`AnnouncedResultTableRow`/`Card`,
  `UpcomingResultTableRow`/`Card`).
- Each row shows an "Expected"/"vs. Trend" chip with a tooltip explicitly
  disclaiming that it's the app's own heuristic from trailing quarterly
  profit trend — not a real analyst/street estimate. This UI disclaimer
  exists because the backend's own naming (Beat Trend/Below Trend) could
  otherwise be misread as analyst-consensus language.

## 8. Order Wins tab — `pages/OrderWins/OrderWinsPage.tsx` + `OrderWins/AwardWinningStockItem.tsx`

**What it does:** a feed of BSE order-win announcements enriched with
market cap / fundamental score / rating, sortable and paginated.

**Behind the scenes:**
- **Naming quirk worth knowing**: this page is wired into the dashboard
  through `components/Placeholders/PlaceholderTabs.tsx`'s `PlaceholderTab`
  component — `type === 'orders'` short-circuits straight to
  `<OrderWinsPage />` before reaching any actual placeholder content. It's
  a fully real, working feature; it's just still organized under a
  component literally named "Placeholder" left over from before this tab
  was built out. Only `type === 'more'` still renders genuine placeholder
  cards today.
- Loads once on mount only — changing filters requires an explicit
  Fetch/pagination click, same pattern Results Calendar used to follow.
  Order Wins still pre-fills its search field with the literal `"P"` (see
  Known rough edges); Results Calendar's equivalent field was removed
  entirely as part of the Screener.in migration cleanup, since the backend
  never honored it.
- Independently sortable by fundamental score via a clickable column
  header (asc/desc toggle), separate from the pagination controls.
- Same `requestIdRef` stale-response-discarding pattern as Results
  Calendar.
- Calls `getAwardWinningStocks`, which sends the page-number query
  parameter as `pageNo` (capital N) on the wire — this now matches what
  the backend's `@RequestParam int pageNo` actually binds to. (The local
  TypeScript query-object field is still named lowercase `pageno`, but
  that's just an internal variable name — it doesn't affect what's
  actually sent over HTTP.)

## 9. Theme + demo data

- `App.tsx` owns light/dark mode as local state, feeding an MUI theme
  (`theme.ts`) with a blue primary palette and Inter font — no persistence,
  resets to light on reload.
- `data/demoStock.ts` is the offline fallback for the *main dashboard bundle
  only* (fundamentals/score/technicals) — AI Analysis, News, Results
  Calendar, and Order Wins each call their own dedicated endpoint directly
  and have no demo/offline equivalent; if those specific calls fail, that
  tab shows its own error state rather than falling back to canned data.

## Known rough edges

- All-or-nothing demo fallback in `getStockBundle` (section 2) — a single
  Yahoo Finance hiccup on `/indicators` throws away a perfectly good
  fundamentals fetch too.
- `useStock`'s error path is effectively dead code today, for the same
  reason.
- No shared state/cache across tabs or components — every tab manages its
  own `useState`/`useEffect` fetch independently (no React Query/Redux/etc.),
  so switching tabs and back always re-fetches from scratch except where a
  component explicitly avoids it.
- The "P" default search-filter value on Order Wins looks like a leftover
  dev default, not an intentional default filter — worth confirming with
  whoever added it before relying on "no search text" behavior. (Results
  Calendar's equivalent field was removed entirely during the Screener.in
  migration cleanup, since the backend never honored it.)
- `AwardWinningStocksQuery.pageno` (lowercase, TS-only) vs. what's actually
  sent on the wire (`pageNo`) is a naming inconsistency worth cleaning up
  even though it's not a functional bug.

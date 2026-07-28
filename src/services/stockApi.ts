import { demoFundamentals, demoIndicators, demoScore } from '../data/demoStock';
import type {
  AiAnalysis,
  AiChatMessage,
  AnnouncedResultStock,
  AnnouncedResultsEnrichmentProgress,
  AnnouncedResultsPage,
  AwardWinningStock,
  AwardWinningStocksEnrichmentProgress,
  AwardWinningStocksPage,
  AwardWinningStocksQuery,
  CompanyFundamentals,
  IndicatorPoint,
  Metric,
  ResultsCalendarQuery,
  ScoreTone,
  StockBundle,
  StockNewsItem,
  StockScore,
  StockSearchResult,
  TechnicalIndicators,
} from '../types/stock';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeDateParam(value?: string): string {
  return (value || '').replace(/[^0-9]/g, '');
}

function toText(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  if (!text || text === '—') {
    return undefined;
  }

  return text;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseFloat(String(value).replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeAwardWinningStock(raw: any): AwardWinningStock {
  return {
    companyName: toText(raw?.companyName) || toText(raw?.company_name) || 'Unknown company',
    symbol: toText(raw?.symbol) || '—',
    orderFromWho: toText(raw?.orderFromWho),
    orderAmount: toText(raw?.orderAmount),
    marketCap: toText(raw?.marketCap),
    fundamentalScore: toOptionalNumber(raw?.fundamentalScore),
    rating: toText(raw?.rating),
    announcementHeadline: toText(raw?.announcementHeadline),
    announcementDate: toText(raw?.announcementDate),
    sourceUrl: toText(raw?.sourceUrl),
  };
}

function extractAwardWinningItems(raw: any): AwardWinningStock[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  const candidates = [raw?.data, raw?.items, raw?.results, raw?.stocks, raw?.payload?.data, raw?.payload?.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractListItems(raw: any): any[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  const candidates = [raw?.data, raw?.items, raw?.results, raw?.stocks, raw?.payload?.data, raw?.payload?.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeAnnouncedResultStock(raw: any): AnnouncedResultStock {
  return {
    companyName: toText(raw?.companyName) || toText(raw?.company_name) || 'Unknown company',
    symbol: toText(raw?.symbol) || '—',
    marketCap: toText(raw?.marketCap),
    fundamentalScore: toOptionalNumber(raw?.fundamentalScore),
    rating: toText(raw?.rating),
    resultDate: toText(raw?.resultDate),
    latestQuarterSales: toText(raw?.latestQuarterSales),
    latestQuarterNetProfit: toText(raw?.latestQuarterNetProfit),
    qoqProfitGrowthPercent: toOptionalNumber(raw?.qoqProfitGrowthPercent),
    yoyProfitGrowthPercent: toOptionalNumber(raw?.yoyProfitGrowthPercent),
    priorTrendDirection: toText(raw?.priorTrendDirection),
    actualVsExpected: toText(raw?.actualVsExpected),
    note: toText(raw?.note),
    announcementHeadline: toText(raw?.announcementHeadline),
    announcementDate: toText(raw?.announcementDate),
    sourceUrl: toText(raw?.sourceUrl),
  };
}

// Transform raw API response to CompanyFundamentals
function transformFundamentals(raw: any): CompanyFundamentals {
  // Helper to safely convert values to strings
  const toString = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  // Helper to extract percent numbers from various possible fields/strings
  const extractPercent = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const s = String(value).replace('%', '').replace(/[^0-9.-]/g, '').trim();
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  // Helper to safely extract sector as string
  const extractSector = (sectorData: any): string => {
    if (typeof sectorData === 'string') return sectorData;
    if (sectorData?.sector) return String(sectorData.sector);
    if (sectorData?.broadSector) return String(sectorData.broadSector);
    return 'N/A';
  };

  // Helper to safely extract industry as string
  const extractIndustry = (industryData: any): string => {
    if (typeof industryData === 'string') return industryData;
    if (industryData?.industry) return String(industryData.industry);
    if (industryData?.broadIndustry) return String(industryData.broadIndustry);
    return 'N/A';
  };

  // Helper to convert Record to SeriesPoint array
  const toSeriesArray = (record: Record<string, any> = {}): any[] => {
    return Object.entries(record).map(([period, value]) => ({
      period,
      value: typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0,
    }));
  };

  const fundamentals: CompanyFundamentals = {
    // Company Identification
    symbol: toString(raw.symbol),
    companyName: toString(raw.companyName),
    sector: extractSector(raw.sector),
    industry: extractIndustry(raw.sector),

    // Current Price & Performance
    currentPrice: Number(toString(raw.currentPrice).replace(/[^\d.]/g, '')) || 0,
    marketCap: toString(raw.marketCap),
    // Accept multiple possible keys for the change percent coming from the API
    dailyChangePercent: extractPercent(
      raw.changePercent ?? raw.change_percent ?? raw.change ?? raw.dailyChangePercent ?? raw.changePercent,
    ),
    eps: toString(raw.eps),

    // Valuation Metrics
    stockPE: toString(raw.stockPE),
    industryPE: toString(raw.industryPE),
    relativePE: toString(raw.relativePE),
    pbRatio: toString(raw.pbRatio),
    evEbitda: toString(raw.evEbitda),
    dividendYield: toString(raw.dividendYield),

    // Quality & Returns
    roce: toString(raw.roce),
    roe: toString(raw.roe),
    roa: toString(raw.roa),
    dividendPayoutLatest: toString(raw.dividendPayoutLatest),
    promoterPledge: toString(raw.promoterPledge),

    // Growth Metrics
    salesGrowth3Y: toString(raw.salesGrowth3Y),
    salesGrowth5Y: toString(raw.salesGrowth5Y),
    profitGrowth3Y: toString(raw.profitGrowth3Y),
    profitGrowth5Y: toString(raw.profitGrowth5Y),

    // Profitability
    operatingProfitMargin: toString(raw.operatingProfitMargin),
    netProfitMargin: toString(raw.netProfitMargin),

    // Financial Health
    debtToEquity: toString(raw.debtToEquity),
    currentRatio: toString(raw.currentRatio),
    interestCoverage: toString(raw.interestCoverage),
    borrowings: toString(raw.borrowings),
    reserves: toString(raw.reserves),

    // Cash Flow
    operatingCashFlow: toString(raw.operatingCashFlow),
    freeCashFlow: toString(raw.freeCashFlow),
    netCashFlow: toString(raw.netCashFlow),

    // Shareholding
    promoterHolding: toString(raw.promoterHolding),
    fiiHolding: toString(raw.fiiHolding),
    diiHolding: toString(raw.diiHolding),
    publicHolding: toString(raw.publicHolding),

    // Series Data for Charts
    operatingCashFlowSeries: raw.operatingCashFlowSeries || {},
    freeCashFlowSeries: raw.freeCashFlowSeries || {},
    netCashFlowSeries: raw.netCashFlowSeries || {},
    epsQuarterly: raw.epsQuarterly || {},
    opmQuarterly: raw.opmQuarterly || {},

    // Shareholding Quarterly Trends
    promoterHoldingQuarterly: raw.promoterHoldingQuarterly || {},
    fiiHoldingQuarterly: raw.fiiHoldingQuarterly || {},
    diiHoldingQuarterly: raw.diiHoldingQuarterly || {},
    publicHoldingQuarterly: raw.publicHoldingQuarterly || {},

    // Shareholding object for components
    shareholding: {
      current: {
        promoters: parseFloat(toString(raw.promoterHolding).replace('%', '')) || 0,
        fiis: parseFloat(toString(raw.fiiHolding).replace('%', '')) || 0,
        diis: parseFloat(toString(raw.diiHolding).replace('%', '')) || 0,
        public: parseFloat(toString(raw.publicHolding).replace('%', '')) || 0,
      },
      promoterHoldingQuarterly: toSeriesArray(raw.promoterHoldingQuarterly),
      fiiHoldingQuarterly: toSeriesArray(raw.fiiHoldingQuarterly),
      diiHoldingQuarterly: toSeriesArray(raw.diiHoldingQuarterly),
      publicHoldingQuarterly: toSeriesArray(raw.publicHoldingQuarterly),
    },

    // Insights - handle both string arrays and object arrays with title/detail
    pros: Array.isArray(raw.pros) 
      ? raw.pros.map((item: any) => 
          typeof item === 'string' ? item : (item?.title || toString(item))
        )
      : [],
    cons: Array.isArray(raw.cons)
      ? raw.cons.map((item: any) => 
          typeof item === 'string' ? item : (item?.detail || toString(item))
        )
      : [],
  };

  return fundamentals;
}

// The backend sends derivedMetrics as a flat Map<String, Object>
// (DerivedMetricsCalculator.compute), not a list — this reads those exact
// keys and turns them into display-ready Metric entries.
function trendTone(label: string | undefined): ScoreTone | undefined {
  switch (label) {
    case 'Rising':
    case 'Accumulating':
      return 'good';
    case 'Stable':
    case 'Flat':
      return 'watch';
    case 'Declining':
    case 'Sharply Declining':
    case 'Distributing':
      return 'risk';
    default:
      return undefined;
  }
}

function transformDerivedMetrics(raw: Record<string, any> | null | undefined): Metric[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const num = (key: string): number | null => {
    const value = Number(raw[key]);
    return Number.isFinite(value) ? value : null;
  };

  const metrics: Metric[] = [];

  const relativePE = num('relativePE');
  if (relativePE !== null) {
    metrics.push({ label: 'Relative PE', value: `${relativePE.toFixed(2)}x` });
  }

  const peg = num('peg');
  if (peg !== null) {
    metrics.push({ label: 'PEG', value: `${peg.toFixed(2)}x` });
  }

  const growthQualityRatio = num('growthQualityRatio');
  if (growthQualityRatio !== null) {
    metrics.push({
      label: 'Growth Quality Ratio',
      value: growthQualityRatio.toFixed(2),
      tone: growthQualityRatio >= 0.8 ? 'good' : undefined,
    });
  }

  const earningsStabilityIndex = num('earningsStabilityIndex');
  if (earningsStabilityIndex !== null) {
    metrics.push({
      label: 'Earnings Stability (CV)',
      value: earningsStabilityIndex.toFixed(2),
      tone: earningsStabilityIndex <= 0.3 ? 'good' : undefined,
    });
  }

  const fcfMargin = num('fcfMargin');
  if (fcfMargin !== null) {
    metrics.push({ label: 'FCF Margin', value: `${(fcfMargin * 100).toFixed(1)}%` });
  }

  const cfoConsistency = num('cfoConsistency');
  if (cfoConsistency !== null) {
    metrics.push({
      label: 'CFO Consistency',
      value: `${cfoConsistency.toFixed(0)}%`,
      tone:
        cfoConsistency >= 90 ? 'excellent' : cfoConsistency >= 60 ? 'good' : cfoConsistency >= 25 ? 'watch' : 'risk',
    });
  }

  const otherIncomeDependencyRatio = num('otherIncomeDependencyRatio');
  if (otherIncomeDependencyRatio !== null) {
    metrics.push({
      label: 'Other Income Dependency',
      value: `${(otherIncomeDependencyRatio * 100).toFixed(1)}%`,
    });
  }

  const promoterTrend = toText(raw.promoterTrend);
  if (promoterTrend) {
    const slope = num('promoterTrendSlope');
    metrics.push({
      label: 'Promoter Trend',
      value: promoterTrend,
      helper: slope !== null ? `slope ${slope.toFixed(2)}` : undefined,
      tone: trendTone(promoterTrend),
    });
  }

  const institutionalTrend = toText(raw.institutionalAccumulationTrend);
  if (institutionalTrend) {
    const slope = num('institutionalTrendSlope');
    metrics.push({
      label: 'Institutional Trend',
      value: institutionalTrend,
      helper: slope !== null ? `slope ${slope.toFixed(2)}` : undefined,
      tone: trendTone(institutionalTrend),
    });
  }

  return metrics;
}

// Transform raw API response to StockScore
function transformScore(raw: any): StockScore {
  return {
    finalScore: Number(raw.finalScore) || 0,
    rating: String(raw.rating || 'N/A'),
    scoreBreakdown: Array.isArray(raw.scoreBreakdown) ? raw.scoreBreakdown : [],
    greenFlags: Array.isArray(raw.greenFlags)
      ? raw.greenFlags.map((item: any) =>
          typeof item === 'string' ? item : (item?.title || String(item))
        )
      : [],
    redFlags: Array.isArray(raw.redFlags)
      ? raw.redFlags.map((item: any) =>
          typeof item === 'string' ? item : (item?.title || item?.detail || String(item))
        )
      : [],
    derivedMetrics: transformDerivedMetrics(raw.derivedMetrics),
  };
}

// The backend's StockIndicatorResponse has no `candles` field — it returns
// `bars` plus parallel per-index arrays (sma20/sma50/ema20/rsi14), a
// macd/bollinger object, and a `latest` snapshot. This zips them into the
// flat per-candle shape the charts/tab actually consume, and derives the
// one summary label the backend doesn't provide (a MACD crossover state).
const INDICATOR_RANGE = '6mo';

function transformIndicators(raw: any, range: string): TechnicalIndicators {
  const bars = Array.isArray(raw?.bars) ? raw.bars : [];

  const at = (arr: any, i: number): number | null => {
    const value = arr?.[i];
    return Number.isFinite(value) ? value : null;
  };

  const candles: IndicatorPoint[] = bars.map((bar: any, i: number) => ({
    date: String(bar?.date ?? ''),
    open: Number(bar?.open) || 0,
    high: Number(bar?.high) || 0,
    low: Number(bar?.low) || 0,
    close: Number(bar?.close) || 0,
    volume: Number(bar?.volume) || 0,
    sma20: at(raw?.sma20, i),
    sma50: at(raw?.sma50, i),
    ema20: at(raw?.ema20, i),
    rsi: at(raw?.rsi14, i),
    macd: at(raw?.macd?.macdLine, i),
    signal: at(raw?.macd?.signalLine, i),
    histogram: at(raw?.macd?.histogram, i),
    bollingerUpper: at(raw?.bollinger?.upper, i),
    bollingerMiddle: at(raw?.bollinger?.middle, i),
    bollingerLower: at(raw?.bollinger?.lower, i),
    averageVolume: at(raw?.avgVolume20, i),
  }));

  const snapshot = raw?.latest ?? {};
  const macd = Number.isFinite(snapshot.macd) ? snapshot.macd : null;
  const macdSignalLine = Number.isFinite(snapshot.macdSignal) ? snapshot.macdSignal : null;
  const macdSignal =
    macd === null || macdSignalLine === null
      ? 'Neutral'
      : macd > macdSignalLine
        ? 'Bullish Crossover'
        : macd < macdSignalLine
          ? 'Bearish Crossover'
          : 'Neutral';

  return {
    exchange: String(raw?.exchange ?? ''),
    range,
    candles,
    latest: {
      close: Number(snapshot.close) || 0,
      change: Number(snapshot.change) || 0,
      changePercent: Number(snapshot.changePercent) || 0,
      volume: Number(snapshot.volume) || 0,
      averageVolume: Number.isFinite(snapshot.avgVolume) ? snapshot.avgVolume : null,
      rsi: Number.isFinite(snapshot.rsi) ? snapshot.rsi : null,
      macd,
      macdSignalLine,
      trendSignal: String(snapshot.trendSignal ?? 'Neutral'),
      rsiSignal: String(snapshot.rsiSignal ?? 'Neutral'),
      macdSignal,
      volumeSignal: String(snapshot.volumeSignal ?? 'Neutral'),
    },
  };
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  return getJson<StockSearchResult[]>(`/api/stocks/search?q=${encodeURIComponent(q)}`);
}

export async function getStockBundle(symbol: string): Promise<StockBundle> {
  const normalizedSymbol = symbol.trim().toUpperCase() || 'RELIANCE';

  try {
    // Merged endpoint returns { fundamentals: {...}, score: {...} }
    const [analysisRaw, indicatorsRaw] = await Promise.all([
      getJson<any>(`/api/stocks/${normalizedSymbol}/fundamentals/analysis`),
      getJson<any>(`/api/stocks/${normalizedSymbol}/indicators?exchange=NSE&range=${INDICATOR_RANGE}`),
    ]);

    // Support both the merged shape and a fallback flat shape
    const fundamentalsRaw = analysisRaw?.fundamentals ?? analysisRaw ?? {};
    const scoreRaw = analysisRaw?.score ?? (analysisRaw?.score === undefined ? {} : analysisRaw?.score);

    const fundamentals = transformFundamentals(fundamentalsRaw);
    const indicators = transformIndicators(indicatorsRaw, INDICATOR_RANGE);
    const score = transformScore(scoreRaw);

    return { fundamentals, indicators, score, isDemo: false };
  } catch (error) {
    console.error("Falling back to demo data — failed to fetch stock data:", error);
    return {
      fundamentals: { ...demoFundamentals, symbol: normalizedSymbol },
      indicators: demoIndicators,
      score: demoScore,
      isDemo: true,
    };
  }
}

export async function getAiAnalysis(symbol: string): Promise<AiAnalysis> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  return getJson<AiAnalysis>(`/api/stocks/${normalizedSymbol}/ai-analysis?exchange=NSE&range=${INDICATOR_RANGE}`);
}

export async function getStockNews(symbol: string): Promise<StockNewsItem[]> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  return getJson<StockNewsItem[]>(`/api/stocks/${normalizedSymbol}/news`);
}

export async function sendAiChatMessage(
  symbol: string,
  history: AiChatMessage[],
  message: string,
): Promise<string> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const res = await postJson<{ reply: string }>(
    `/api/stocks/${normalizedSymbol}/ai-chat?exchange=NSE&range=${INDICATOR_RANGE}`,
    { history, message },
  );
  return res.reply;
}

export async function getAwardWinningStocks(query: AwardWinningStocksQuery = {}): Promise<AwardWinningStocksPage> {
  const params = new URLSearchParams();
  const pageNo = Number.isFinite(query.pageNo) && (query.pageNo || 0) > 0 ? Math.floor(query.pageNo || 1) : 1;

  params.set('pageNo', String(pageNo));

  const prevDate = normalizeDateParam(query.prevDate);
  const toDate = normalizeDateParam(query.toDate);
  const search = (query.search || '').trim();

  if (prevDate) {
    params.set('prevDate', prevDate);
  }

  if (toDate) {
    params.set('toDate', toDate);
  }

  if (search) {
    params.set('search', search);
  }

  const raw = await getJson<any>(`/api/stocks/awards?${params.toString()}`);
  const items = extractAwardWinningItems(raw).map(normalizeAwardWinningStock);

  return {
    items,
    pageNo: Number(raw?.pageNo ?? raw?.page ?? pageNo) || pageNo,
    totalPages: raw?.totalPages ?? raw?.total_pages ?? raw?.pages ?? null,
    totalCount: raw?.totalCount ?? raw?.total_count ?? raw?.count ?? null,
  };
}

// Polled while a getAwardWinningStocks() call is in flight to show live per-company
// enrichment progress. Best-effort only — the backend tracker is a single global
// in-memory counter (this is a single-user app), so a failed poll just means "no
// update this tick," not a real error worth surfacing.
export async function getAwardWinningStocksProgress(): Promise<AwardWinningStocksEnrichmentProgress> {
  const raw = await getJson<any>('/api/stocks/awards/progress');
  return {
    completed: Number(raw?.completed) || 0,
    total: Number(raw?.total) || 0,
  };
}

function resultsQueryParams(query: ResultsCalendarQuery): { params: URLSearchParams; pageNo: number } {
  const params = new URLSearchParams();
  const pageNo = Number.isFinite(query.pageNo) && (query.pageNo || 0) > 0 ? Math.floor(query.pageNo || 1) : 1;

  params.set('pageNo', String(pageNo));

  return { params, pageNo };
}

export async function getAnnouncedResults(query: ResultsCalendarQuery = {}): Promise<AnnouncedResultsPage> {
  const { params, pageNo } = resultsQueryParams(query);

  const lookbackDays = Number.isFinite(query.lookbackDays) ? Math.floor(query.lookbackDays as number) : null;
  if (lookbackDays) {
    params.set('lookbackDays', String(lookbackDays));
  }

  const raw = await getJson<any>(`/api/stocks/results/announced?${params.toString()}`);
  const items = extractListItems(raw).map(normalizeAnnouncedResultStock);
  return {
    items,
    pageNo: Number(raw?.pageNo ?? raw?.page ?? pageNo) || pageNo,
    totalPages: raw?.totalPages ?? raw?.total_pages ?? raw?.pages ?? null,
    totalCount: raw?.totalCount ?? raw?.total_count ?? raw?.count ?? null,
  };
}

// Polled while a getAnnouncedResults() call is in flight to show live per-company
// enrichment progress. Best-effort only — the backend tracker is a single global
// in-memory counter (this is a single-user app), so a failed poll just means "no
// update this tick," not a real error worth surfacing.
export async function getAnnouncedResultsProgress(): Promise<AnnouncedResultsEnrichmentProgress> {
  const raw = await getJson<any>('/api/stocks/results/announced/progress');
  return {
    completed: Number(raw?.completed) || 0,
    total: Number(raw?.total) || 0,
  };
}

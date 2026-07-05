import { demoFundamentals, demoIndicators, demoScore } from '../data/demoStock';
import type {
  AwardWinningStock,
  AwardWinningStocksPage,
  AwardWinningStocksQuery,
  CompanyFundamentals,
  StockBundle,
  StockScore,
  TechnicalIndicators,
} from '../types/stock';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeDateParam(value?: string): string {
  return (value || '').replace(/[^0-9]/g, '');
}

function toText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text || text === '—') {
    return null;
  }

  return text;
}

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(String(value).replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
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

// Transform raw API response to CompanyFundamentals
function transformFundamentals(raw: any): CompanyFundamentals {
  console.log("transformFundamentals called with raw:", raw);
  
  // Helper to safely convert values to strings
  const toString = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  // Helper to extract percent numbers from various possible fields/strings
  const extractPercent = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const s = String(value).replace('%', '').replace(/[^0-9.\-]/g, '').trim();
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
    industry: extractIndustry(raw.industry),

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

// Transform raw API response to StockScore
function transformScore(raw: any): StockScore {
  console.log("transformScore called with raw:", raw);
  
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
    derivedMetrics: Array.isArray(raw.derivedMetrics)
      ? raw.derivedMetrics.map((item: any) => ({
          label: item?.label || 'N/A',
          value: typeof item?.value === 'string' ? item.value : String(item?.value || 'N/A'),
          helper: item?.helper,
          tone: item?.tone,
        }))
      : [],
  };
}

export async function getStockBundle(symbol: string): Promise<StockBundle> {
  const normalizedSymbol = symbol.trim().toUpperCase() || 'RELIANCE';

  try {
    console.log("🔄 Fetching stock data for:", normalizedSymbol);
    // New merged endpoint which returns { fundamentals: {...}, score: {...} }
    const [analysisRaw, indicatorsRaw] = await Promise.all([
      getJson<any>(`/api/stocks/${normalizedSymbol}/fundamentals/analysis`),
      getJson<TechnicalIndicators>(`/api/stocks/${normalizedSymbol}/indicators?exchange=NSE&range=6mo`),
    ]);

    // Support both the merged shape and a fallback flat shape
    const fundamentalsRaw = analysisRaw?.fundamentals ?? analysisRaw ?? {};
    const scoreRaw = analysisRaw?.score ?? (analysisRaw?.score === undefined ? {} : analysisRaw?.score);

    console.log("✅ API responses received:", { analysisRaw, indicatorsRaw });

    const fundamentals = transformFundamentals(fundamentalsRaw);
    const indicators = indicatorsRaw;
    const score = transformScore(scoreRaw);
    
    console.log("✅ Transformed fundamentals:", fundamentals);
    console.log("✅ Transformed score:", score);
    return { fundamentals, indicators, score, isDemo: false };
  } catch (error) {
    console.error("❌ Error fetching stock data:", error);
    return {
      fundamentals: { ...demoFundamentals, symbol: normalizedSymbol },
      indicators: demoIndicators,
      score: demoScore,
      isDemo: true,
    };
  }
}

export async function getAwardWinningStocks(query: AwardWinningStocksQuery = {}): Promise<AwardWinningStocksPage> {
  const params = new URLSearchParams();
  const pageNo = Number.isFinite(query.pageno) && (query.pageno || 0) > 0 ? Math.floor(query.pageno || 1) : 1;

  params.set('pageno', String(pageNo));

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

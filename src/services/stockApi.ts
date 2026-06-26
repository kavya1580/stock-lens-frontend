import { demoFundamentals, demoIndicators, demoScore } from '../data/demoStock';
import type { CompanyFundamentals, StockBundle, StockScore, TechnicalIndicators } from '../types/stock';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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
    dailyChangePercent: Number(toString(raw.dailyChangePercent).replace('%', '')) || 0,
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
    const [fundamentalsRaw, indicatorsRaw, scoreRaw] = await Promise.all([
      getJson<any>(`/api/stocks/${normalizedSymbol}/fundamentals`),
      getJson<TechnicalIndicators>(`/api/stocks/${normalizedSymbol}/indicators?exchange=NSE&range=6mo`),
      getJson<any>(`/api/stocks/${normalizedSymbol}/score`),
    ]);
    
    console.log("✅ API responses received:", { fundamentalsRaw, indicatorsRaw, scoreRaw });
    
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

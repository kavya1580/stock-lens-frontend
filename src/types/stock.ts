export type ScoreTone = 'excellent' | 'good' | 'watch' | 'risk';

export interface Metric {
  label: string;
  value: string | number;
  helper?: string;
  tone?: ScoreTone;
}

export interface SeriesPoint {
  period: string;
  value: number;
}

export interface CompanyFundamentals {
  // Company Identification
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;

  // Current Price & Performance
  currentPrice: number;
  marketCap: string;
  dailyChangePercent: number;
  eps: string;

  // Valuation Metrics
  stockPE: string;
  industryPE: string;
  relativePE: string;
  pbRatio: string;
  evEbitda: string;
  dividendYield: string;

  // Quality & Returns
  roce: string;
  roe: string;
  roa: string;

  // Growth Metrics
  salesGrowth3Y: string;
  salesGrowth5Y: string;
  profitGrowth3Y: string;
  profitGrowth5Y: string;

  // Profitability
  operatingProfitMargin: string;
  netProfitMargin: string;

  // Financial Health
  debtToEquity: string;
  currentRatio: string;
  interestCoverage: string;
  borrowings: string;
  reserves: string;

  // Cash Flow
  operatingCashFlow: string;
  freeCashFlow: string;
  netCashFlow: string;

  // Shareholding
  promoterHolding: string;
  fiiHolding: string;
  diiHolding: string;
  publicHolding: string;

  // Series Data for Charts
  operatingCashFlowSeries: Record<string, string>;
  freeCashFlowSeries: Record<string, string>;
  netCashFlowSeries: Record<string, string>;
  epsQuarterly: Record<string, string>;
  opmQuarterly: Record<string, string>;

  // Shareholding Quarterly Trends
  promoterHoldingQuarterly: Record<string, string>;
  fiiHoldingQuarterly: Record<string, string>;
  diiHoldingQuarterly: Record<string, string>;
  publicHoldingQuarterly: Record<string, string>;

  // Shareholding object for components (for compatibility)
  shareholding?: {
    current: {
      promoters: number;
      fiis: number;
      diis: number;
      public: number;
    };
    promoterHoldingQuarterly: SeriesPoint[];
    fiiHoldingQuarterly: SeriesPoint[];
    diiHoldingQuarterly: SeriesPoint[];
    publicHoldingQuarterly: SeriesPoint[];
  };

  // Insights
  pros: string[];
  cons: string[];
}

export interface IndicatorPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20: number;
  sma50: number;
  ema20: number;
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  averageVolume: number;
}

export interface TechnicalIndicators {
  exchange: string;
  range: string;
  candles: IndicatorPoint[];
  latest: {
    trendSignal: string;
    rsiSignal: string;
    macdSignal: string;
    volumeSignal: string;
  };
}

export interface ScoreBreakdownItem {
  category: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface StockScore {
  finalScore: number;
  rating: string;
  scoreBreakdown: ScoreBreakdownItem[];
  greenFlags: string[];
  redFlags: string[];
  derivedMetrics: Metric[];
}

export interface StockBundle {
  fundamentals: CompanyFundamentals;
  indicators: TechnicalIndicators;
  score: StockScore;
  isDemo: boolean;
}

export interface AwardWinningStock {
  companyName?: string;
  symbol?: string;
  orderFromWho?: string;
  orderAmount?: string;
  marketCap?: string;
  fundamentalScore?: number | string;
  rating?: string;
  announcementHeadline?: string;
  announcementDate?: string;
  sourceUrl?: string;
}

export interface AwardWinningStocksQuery {
  pageno?: number;
  prevDate?: string;
  toDate?: string;
  search?: string;
}

export interface AwardWinningStocksPage {
  items: AwardWinningStock[];
  pageNo: number;
  totalPages?: number | null;
  totalCount?: number | null;
}

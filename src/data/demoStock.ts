import type { CompanyFundamentals, SeriesPoint, StockScore, TechnicalIndicators } from '../types/stock';

const quarters = ['Sep 25', 'Dec 25', 'Mar 26', 'Jun 26'];
const cashYears = ['FY21', 'FY22', 'FY23', 'FY24', 'FY25'];

function seriesRecord(periods: string[], values: number[]): Record<string, string> {
  return Object.fromEntries(periods.map((period, index) => [period, String(values[index])]));
}

function seriesPoints(periods: string[], values: number[]): SeriesPoint[] {
  return periods.map((period, index) => ({ period, value: values[index] }));
}

const promoterHoldingQuarterlyValues = [50.1, 50.2, 50.3, 50.3];
const fiiHoldingQuarterlyValues = [20.7, 21.1, 21.5, 21.9];
const diiHoldingQuarterlyValues = [18.4, 18.2, 17.9, 17.6];
const publicHoldingQuarterlyValues = [10.8, 10.5, 10.3, 10.2];

export const demoFundamentals: CompanyFundamentals = {
  // Company Identification
  symbol: 'RELIANCE',
  companyName: 'Reliance Industries Limited',
  sector: 'Energy & Consumer',
  industry: 'Oil to Chemicals, Retail, Telecom',

  // Current Price & Performance
  currentPrice: 2864,
  marketCap: '19.38L Cr',
  dailyChangePercent: 1.42,
  eps: 'Rs 104.7',

  // Valuation Metrics
  stockPE: '27.4',
  industryPE: '24.1',
  relativePE: '1.14x',
  pbRatio: '2.28x',
  evEbitda: '13.6x',
  dividendYield: '0.34%',
  dividendPayoutLatest: '18.5%',
  promoterPledge: '0.0%',

  // Quality & Returns
  roce: '10.8%',
  roe: '9.1%',
  roa: '4.8%',

  // Growth Metrics
  salesGrowth3Y: '17.8%',
  salesGrowth5Y: '12.6%',
  profitGrowth3Y: '15.2%',
  profitGrowth5Y: '13.5%',

  // Profitability
  operatingProfitMargin: '16.2%',
  netProfitMargin: '8.4%',

  // Financial Health
  debtToEquity: '0.42x',
  currentRatio: '1.25x',
  interestCoverage: '5.9x',
  borrowings: '3.22L Cr',
  reserves: '8.64L Cr',

  // Cash Flow
  operatingCashFlow: '1.59L Cr',
  freeCashFlow: '42,800 Cr',
  netCashFlow: '8,450 Cr',

  // Shareholding
  promoterHolding: '50.3%',
  fiiHolding: '21.9%',
  diiHolding: '17.6%',
  publicHolding: '10.2%',

  // Series Data for Charts
  operatingCashFlowSeries: seriesRecord(cashYears, [86000, 101400, 122800, 141200, 159000]),
  freeCashFlowSeries: seriesRecord(cashYears, [18200, 24600, 31800, 37100, 42800]),
  netCashFlowSeries: seriesRecord(cashYears, [-4200, 9300, 6800, 11200, 8450]),
  epsQuarterly: seriesRecord(quarters, [24.1, 25.6, 26.8, 28.2]),
  opmQuarterly: seriesRecord(quarters, [15.4, 15.8, 16.0, 16.2]),

  // Shareholding Quarterly Trends
  promoterHoldingQuarterly: seriesRecord(quarters, promoterHoldingQuarterlyValues),
  fiiHoldingQuarterly: seriesRecord(quarters, fiiHoldingQuarterlyValues),
  diiHoldingQuarterly: seriesRecord(quarters, diiHoldingQuarterlyValues),
  publicHoldingQuarterly: seriesRecord(quarters, publicHoldingQuarterlyValues),

  // Shareholding object for components
  shareholding: {
    current: { promoters: 50.3, fiis: 21.9, diis: 17.6, public: 10.2 },
    promoterHoldingQuarterly: seriesPoints(quarters, promoterHoldingQuarterlyValues),
    fiiHoldingQuarterly: seriesPoints(quarters, fiiHoldingQuarterlyValues),
    diiHoldingQuarterly: seriesPoints(quarters, diiHoldingQuarterlyValues),
    publicHoldingQuarterly: seriesPoints(quarters, publicHoldingQuarterlyValues),
  },

  // Insights
  pros: ['Scale advantages across core businesses', 'Free cash flow trend is improving', 'Institutional ownership remains healthy', 'Multiple consumer growth engines'],
  cons: ['Valuation trades above industry average', 'Capex intensity remains high', 'Energy margins can be cyclical'],
};

const dates = Array.from({ length: 36 }, (_, index) => `D${index + 1}`);
export const demoIndicators: TechnicalIndicators = {
  exchange: 'NSE',
  range: '6mo',
  candles: dates.map((date, index) => {
    const base = 2550 + index * 9 + Math.sin(index / 2.5) * 58;
    const close = Math.round(base + Math.cos(index / 3) * 25);
    return {
      date,
      open: Math.round(close - 18 + Math.sin(index) * 16),
      high: Math.round(close + 32 + Math.cos(index) * 14),
      low: Math.round(close - 42 - Math.sin(index / 2) * 10),
      close,
      volume: Math.round(4600000 + Math.sin(index / 3) * 900000 + index * 36000),
      sma20: Math.round(base - 18),
      sma50: Math.round(base - 42),
      ema20: Math.round(base - 6),
      rsi: Math.round(47 + Math.sin(index / 4) * 15 + index / 6),
      macd: Number((8 + Math.sin(index / 4) * 11).toFixed(2)),
      signal: Number((6 + Math.cos(index / 5) * 8).toFixed(2)),
      histogram: Number((Math.sin(index / 3) * 7).toFixed(2)),
      bollingerUpper: Math.round(base + 96),
      bollingerMiddle: Math.round(base),
      bollingerLower: Math.round(base - 94),
      averageVolume: 5100000,
    };
  }),
  latest: {
    close: 2864,
    change: 40,
    changePercent: 1.42,
    volume: 5100000,
    averageVolume: 5100000,
    rsi: 58,
    macd: 12.4,
    macdSignalLine: 9.1,
    trendSignal: 'Bullish above SMA50',
    rsiSignal: 'Healthy momentum',
    macdSignal: 'Positive crossover',
    volumeSignal: 'Accumulation visible',
  },
};

export const demoScore: StockScore = {
  finalScore: 86.4,
  rating: 'Excellent',
  scoreBreakdown: [
    { category: 'Fundamental Quality', score: 88, weight: 30, explanation: 'Durable cash generation with improving margin mix across consumer businesses.' },
    { category: 'Valuation Comfort', score: 72, weight: 20, explanation: 'Trades at a premium, partially justified by scale and earnings visibility.' },
    { category: 'Growth Momentum', score: 91, weight: 20, explanation: 'Long-term sales and profit growth remain broad-based and resilient.' },
    { category: 'Balance Sheet', score: 84, weight: 15, explanation: 'Leverage is manageable relative to operating cash flows and reserves.' },
    { category: 'Technical Strength', score: 89, weight: 15, explanation: 'Price is trending above key moving averages with constructive momentum.' },
  ],
  greenFlags: ['Strong CFO/OP conversion', 'Improving ROCE trajectory', 'Institutional accumulation visible', 'Positive medium-term trend'],
  redFlags: ['Valuation premium versus industry PE'],
  derivedMetrics: [
    { label: 'PEG', value: '1.52x' },
    { label: 'Relative PE', value: '1.14x' },
    { label: 'Growth Quality Ratio', value: '0.83', tone: 'good' },
    { label: 'Earnings Stability Index', value: '91/100', tone: 'excellent' },
    { label: 'FCF Margin', value: '4.7%' },
    { label: 'CFO Consistency', value: 'High', tone: 'excellent' },
    { label: 'Institutional Trend', value: 'Accumulating', tone: 'good' },
  ],
};

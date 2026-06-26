import type { CompanyFundamentals, StockScore, TechnicalIndicators } from '../types/stock';

const quarters = ['Sep 25', 'Dec 25', 'Mar 26', 'Jun 26'];
const cashYears = ['FY21', 'FY22', 'FY23', 'FY24', 'FY25'];

export const demoFundamentals: CompanyFundamentals = {
  companyName: 'Reliance Industries Limited',
  symbol: 'RELIANCE',
  currentPrice: 2864,
  dailyChangePercent: 1.42,
  sector: 'Energy & Consumer',
  industry: 'Oil to Chemicals, Retail, Telecom',
  snapshot: [
    { label: 'Market Cap', value: '19.38L Cr', helper: 'Large cap leader', tone: 'excellent' },
    { label: 'Current Price', value: 'Rs 2,864' },
    { label: 'Stock PE', value: 27.4 },
    { label: 'Industry PE', value: 24.1 },
    { label: 'Relative PE', value: '1.14x', helper: 'Mild premium' },
    { label: 'PB Ratio', value: '2.28x' },
    { label: 'EV/EBITDA', value: '13.6x' },
    { label: 'Dividend Yield', value: '0.34%' },
    { label: 'Book Value', value: 'Rs 1,257' },
    { label: 'Face Value', value: 'Rs 10' },
  ],
  profitability: [
    { label: 'ROE', value: '9.1%', helper: 'Stable', tone: 'good' },
    { label: 'ROCE', value: '10.8%', helper: 'Improving', tone: 'good' },
    { label: 'ROA', value: '4.8%' },
    { label: 'EPS', value: 'Rs 104.7' },
    { label: 'Operating Margin', value: '16.2%', tone: 'excellent' },
    { label: 'Net Margin', value: '8.4%' },
  ],
  growth: {
    sales: [
      { label: '3Y', value: '17.8%' },
      { label: '5Y', value: '12.6%' },
      { label: '10Y', value: '10.1%' },
      { label: 'Latest', value: '9.4%', tone: 'good' },
    ],
    profit: [
      { label: '3Y', value: '15.2%' },
      { label: '5Y', value: '13.5%' },
      { label: '10Y', value: '12.9%' },
      { label: 'Latest', value: '10.7%', tone: 'good' },
    ],
    stockCagr: [
      { label: '3Y', value: '18.6%' },
      { label: '5Y', value: '16.8%' },
      { label: '10Y', value: '17.4%' },
      { label: 'Latest', value: '21.2%', tone: 'excellent' },
    ],
  },
  financialHealth: [
    { label: 'Borrowings', value: '3.22L Cr' },
    { label: 'Reserves', value: '8.64L Cr', tone: 'excellent' },
    { label: 'Debt to Equity', value: '0.42x', tone: 'good' },
    { label: 'Current Ratio', value: '1.25x' },
    { label: 'Interest Coverage', value: '5.9x', tone: 'good' },
  ],
  cashFlow: {
    metrics: [
      { label: 'Operating Cash Flow', value: '1.59L Cr', tone: 'excellent' },
      { label: 'Free Cash Flow', value: '42,800 Cr', tone: 'good' },
      { label: 'Net Cash Flow', value: '8,450 Cr' },
      { label: 'CFO / Operating Profit', value: '0.91x', tone: 'good' },
    ],
    operatingCashFlowSeries: cashYears.map((period, index) => ({ period, value: [86000, 101400, 122800, 141200, 159000][index] })),
    freeCashFlowSeries: cashYears.map((period, index) => ({ period, value: [18200, 24600, 31800, 37100, 42800][index] })),
    netCashFlowSeries: cashYears.map((period, index) => ({ period, value: [-4200, 9300, 6800, 11200, 8450][index] })),
  },
  efficiency: [
    { label: 'Asset Turnover', value: '0.58x' },
    { label: 'Inventory Turnover', value: '7.2x', tone: 'good' },
    { label: 'Debtor Days', value: '18' },
    { label: 'Receivable Days', value: '21' },
    { label: 'Working Capital Days', value: '36' },
    { label: 'Inventory Days', value: '51' },
    { label: 'Days Payable', value: '43' },
    { label: 'Cash Conversion Cycle', value: '29 days', tone: 'good' },
  ],
  shareholding: {
    current: { promoters: 50.3, fiis: 21.9, diis: 17.6, public: 10.2 },
    promoterHoldingQuarterly: quarters.map((period, index) => ({ period, value: [50.1, 50.2, 50.3, 50.3][index] })),
    fiiHoldingQuarterly: quarters.map((period, index) => ({ period, value: [20.7, 21.1, 21.5, 21.9][index] })),
    diiHoldingQuarterly: quarters.map((period, index) => ({ period, value: [18.4, 18.2, 17.9, 17.6][index] })),
    publicHoldingQuarterly: quarters.map((period, index) => ({ period, value: [10.8, 10.5, 10.3, 10.2][index] })),
  },
  sectorInformation: [
    { label: 'Broad Sector', value: 'Diversified' },
    { label: 'Sector', value: 'Energy & Consumer Platforms' },
    { label: 'Broad Industry', value: 'Oil, Retail, Telecom' },
    { label: 'Industry', value: 'Integrated Conglomerate' },
  ],
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

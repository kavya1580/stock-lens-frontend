import { Chip, Grid, Stack, Typography } from '@mui/material';
import type { ScoreTone, TechnicalIndicators } from '../../types/stock';
import { currency, percent } from '../../utils/format';
import { MetricCard } from '../Common/MetricCard';
import { Section } from '../Common/Section';
import { ChartCard } from '../Charts/ChartCard';
import { MacdChart, PriceChart, RsiChart, VolumeChart } from '../Charts/TechnicalCharts';

interface TechnicalTabProps {
  indicators: TechnicalIndicators;
}

const TREND_TONE: Record<string, ScoreTone> = { Bullish: 'excellent', Bearish: 'risk', Neutral: 'watch' };
const RSI_TONE: Record<string, ScoreTone> = { Overbought: 'watch', Oversold: 'watch', Neutral: 'good' };
const MACD_TONE: Record<string, ScoreTone> = {
  'Bullish Crossover': 'excellent',
  'Bearish Crossover': 'risk',
  Neutral: 'watch',
};
const VOLUME_TONE: Record<string, ScoreTone> = { 'Above Average': 'good', 'Below Average': 'watch', Neutral: 'good' };

const PRICE_CHART_LEGEND = [
  { label: 'SMA20', color: '#2563eb' },
  { label: 'SMA50', color: '#d97706' },
  { label: 'EMA20', color: '#7c3aed' },
  { label: 'Bollinger Upper', color: '#64748b' },
  { label: 'Middle', color: '#94a3b8' },
  { label: 'Lower', color: '#64748b' },
];

function formatVolume(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function TechnicalTab({ indicators }: TechnicalTabProps) {
  const { latest } = indicators;

  const summary = [
    {
      label: 'Price',
      value: currency(latest.close),
      helper: `${percent(latest.changePercent)} (${latest.change >= 0 ? '+' : ''}${latest.change.toFixed(2)})`,
      tone: latest.change >= 0 ? ('excellent' as ScoreTone) : ('risk' as ScoreTone),
    },
    {
      label: 'Trend',
      value: latest.trendSignal,
      tone: TREND_TONE[latest.trendSignal],
    },
    {
      label: 'RSI',
      value: latest.rsiSignal,
      helper: latest.rsi !== null ? latest.rsi.toFixed(1) : 'N/A',
      tone: RSI_TONE[latest.rsiSignal],
    },
    {
      label: 'MACD',
      value: latest.macdSignal,
      helper:
        latest.macd !== null && latest.macdSignalLine !== null
          ? `histogram ${(latest.macd - latest.macdSignalLine).toFixed(2)}`
          : undefined,
      tone: MACD_TONE[latest.macdSignal],
    },
    {
      label: 'Volume',
      value: latest.volumeSignal,
      helper: `${formatVolume(latest.volume)} vs avg ${formatVolume(latest.averageVolume)}`,
      tone: VOLUME_TONE[latest.volumeSignal],
    },
  ];

  const hasHistory = indicators.candles.length > 0;

  return (
    <Stack spacing={3}>
      <Section title="Technical Summary" subtitle={`${indicators.exchange} analysis over ${indicators.range}.`}>
        <Grid container spacing={2}>
          {summary.map((metric) => (
            <Grid item xs={12} sm={6} md={2.4} key={metric.label}>
              <MetricCard metric={metric} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {!hasHistory ? (
        <Typography color="text.secondary">Not enough historical data to chart yet.</Typography>
      ) : (
        <>
          <ChartCard
            title="Price Chart"
            subtitle="Candlestick-style price action with SMA20, SMA50, EMA20, and Bollinger Bands."
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {PRICE_CHART_LEGEND.map(({ label, color }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: color, color }}
                />
              ))}
            </Stack>
            <PriceChart candles={indicators.candles} />
          </ChartCard>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartCard title="RSI" subtitle="Momentum with overbought and oversold reference levels.">
                <RsiChart candles={indicators.candles} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="MACD" subtitle="MACD line, signal line, and histogram.">
                <MacdChart candles={indicators.candles} />
              </ChartCard>
            </Grid>
            <Grid item xs={12}>
              <ChartCard title="Volume" subtitle="Daily traded volume with average volume baseline.">
                <VolumeChart candles={indicators.candles} />
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}

import { Chip, Grid, Stack } from '@mui/material';
import type { TechnicalIndicators } from '../../types/stock';
import { MetricCard } from '../Common/MetricCard';
import { Section } from '../Common/Section';
import { ChartCard } from '../Charts/ChartCard';
import { MacdChart, PriceChart, RsiChart, VolumeChart } from '../Charts/TechnicalCharts';

interface TechnicalTabProps {
  indicators: TechnicalIndicators;
}

export function TechnicalTab({ indicators }: TechnicalTabProps) {
  const latest = indicators.candles[indicators.candles.length - 1];
  const summary = [
    { label: 'Trend', value: indicators.latest.trendSignal, tone: 'excellent' as const },
    { label: 'RSI', value: indicators.latest.rsiSignal, helper: String(latest.rsi), tone: 'good' as const },
    { label: 'MACD', value: indicators.latest.macdSignal, tone: 'excellent' as const },
    { label: 'Volume', value: indicators.latest.volumeSignal, tone: 'good' as const },
  ];

  return (
    <Stack spacing={3}>
      <Section title="Technical Summary" subtitle={`${indicators.exchange} analysis over ${indicators.range}.`}>
        <Grid container spacing={2}>
          {summary.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <MetricCard metric={metric} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <ChartCard title="Price Chart" subtitle="Candlestick-style price action with SMA20, SMA50, EMA20, and Bollinger Bands.">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {['SMA20', 'SMA50', 'EMA20', 'Bollinger Upper', 'Middle', 'Lower'].map((label) => (
            <Chip key={label} label={label} size="small" variant="outlined" />
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
    </Stack>
  );
}

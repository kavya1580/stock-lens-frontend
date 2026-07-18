import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { IndicatorPoint } from '../../types/stock';

interface TechnicalChartsProps {
  candles: IndicatorPoint[];
}

export function PriceChart({ candles }: TechnicalChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={390}>
      <ComposedChart data={candles} margin={{ top: 8, right: 14, left: -4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={18} />
        <YAxis domain={['dataMin - 80', 'dataMax + 80']} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="high" barSize={2} fill="#94a3b8" />
        <Bar dataKey="close" barSize={10}>
          {candles.map((entry) => (
            <Cell key={entry.date} fill={entry.close >= entry.open ? '#16a34a' : '#dc2626'} />
          ))}
        </Bar>
        <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#d97706" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ema20" name="EMA 20" stroke="#7c3aed" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="bollingerUpper" name="BB Upper" stroke="#64748b" strokeDasharray="5 5" dot={false} />
        <Line type="monotone" dataKey="bollingerMiddle" name="BB Middle" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
        <Line type="monotone" dataKey="bollingerLower" name="BB Lower" stroke="#64748b" strokeDasharray="5 5" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RsiChart({ candles }: TechnicalChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={candles} margin={{ top: 8, right: 14, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <Tooltip />
        <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="5 5" label="70" />
        <ReferenceLine y={30} stroke="#16a34a" strokeDasharray="5 5" label="30" />
        <Line type="monotone" dataKey="rsi" stroke="#2563eb" strokeWidth={3} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MacdChart({ candles }: TechnicalChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={candles} margin={{ top: 8, right: 14, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="histogram" name="Histogram" barSize={8}>
          {candles.map((entry) => (
            <Cell key={entry.date} fill={(entry.histogram ?? 0) >= 0 ? '#16a34a' : '#dc2626'} />
          ))}
        </Bar>
        <Line type="monotone" dataKey="macd" name="MACD" stroke="#2563eb" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="signal" name="Signal" stroke="#d97706" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart({ candles }: TechnicalChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={candles} margin={{ top: 8, right: 14, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
        <Tooltip formatter={(value) => Number(value).toLocaleString('en-IN')} />
        <Bar dataKey="volume" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="averageVolume" name="Average Volume" stroke="#d97706" strokeWidth={2.5} dot={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

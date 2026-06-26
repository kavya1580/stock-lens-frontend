import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { SeriesPoint } from '../../types/stock';

interface MetricLineChartProps {
  data: SeriesPoint[];
  color: string;
}

export function MetricLineChart({ data, color }: MetricLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="period" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
        <Tooltip formatter={(value) => [`${Number(value).toLocaleString('en-IN')} Cr`, 'Value']} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

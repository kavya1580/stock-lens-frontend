import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { CompanyFundamentals } from '../../types/stock';

interface ShareholdingTrendProps {
  shareholding: CompanyFundamentals['shareholding'];
}

export function ShareholdingTrend({ shareholding }: ShareholdingTrendProps) {
  const data = shareholding.promoterHoldingQuarterly.map((point, index) => ({
    period: point.period,
    Promoters: point.value,
    FIIs: shareholding.fiiHoldingQuarterly[index].value,
    DIIs: shareholding.diiHoldingQuarterly[index].value,
    Public: shareholding.publicHoldingQuarterly[index].value,
  }));

  return (
    <ResponsiveContainer width="100%" height={270}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis dataKey="period" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => [`${value}%`, 'Holding']} />
        <Legend />
        <Area type="monotone" dataKey="Promoters" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.22} />
        <Area type="monotone" dataKey="FIIs" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.22} />
        <Area type="monotone" dataKey="DIIs" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.22} />
        <Area type="monotone" dataKey="Public" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.22} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

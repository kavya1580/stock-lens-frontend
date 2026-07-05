import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { CompanyFundamentals } from '../../types/stock';

interface ShareholdingTrendProps {
  shareholding: CompanyFundamentals['shareholding'];
}

export function ShareholdingTrend({ shareholding }: ShareholdingTrendProps) {
  const promoterSeries = shareholding?.promoterHoldingQuarterly ?? [];
  const fiiSeries = shareholding?.fiiHoldingQuarterly ?? [];
  const diiSeries = shareholding?.diiHoldingQuarterly ?? [];
  const publicSeries = shareholding?.publicHoldingQuarterly ?? [];

  const maxLength = Math.max(
    promoterSeries.length,
    fiiSeries.length,
    diiSeries.length,
    publicSeries.length,
  );

  const data = Array.from({ length: maxLength }, (_, index) => {
    const promoterPoint = promoterSeries[index];
    const fiiPoint = fiiSeries[index];
    const diiPoint = diiSeries[index];
    const publicPoint = publicSeries[index];

    return {
      period:
        promoterPoint?.period ??
        fiiPoint?.period ??
        diiPoint?.period ??
        publicPoint?.period ??
        `Q${index + 1}`,
      Promoters: promoterPoint?.value ?? null,
      FIIs: fiiPoint?.value ?? null,
      DIIs: diiPoint?.value ?? null,
      Public: publicPoint?.value ?? null,
    };
  }).filter(
    (point) =>
      point.Promoters !== null ||
      point.FIIs !== null ||
      point.DIIs !== null ||
      point.Public !== null,
  );

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

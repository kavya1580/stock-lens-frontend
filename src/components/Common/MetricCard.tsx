import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import type { Metric } from '../../types/stock';
import { toneColor } from '../../utils/format';

interface MetricCardProps {
  metric: Metric;
  dense?: boolean;
}

export function MetricCard({ metric, dense = false }: MetricCardProps) {
  const theme = useTheme();
  const accent = metric.tone ? toneColor(metric.tone) : theme.palette.primary.main;

  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: theme.palette.divider }}>
      <CardContent sx={{ p: dense ? 2 : 2.5, '&:last-child': { pb: dense ? 2 : 2.5 } }}>
        <Stack spacing={1}>
          <Box sx={{ width: 34, height: 4, borderRadius: 4, bgcolor: accent }} />
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: dense ? 18 : 22 }}>
            {metric.label}
          </Typography>
          <Typography variant={dense ? 'h6' : 'h5'}>{metric.value}</Typography>
          {metric.helper ? (
            <Typography variant="caption" color="text.secondary">
              {metric.helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

import { Box, Stack, Tooltip, Typography } from '@mui/material';

interface ShareholdingBarProps {
  data: {
    promoters: number;
    fiis: number;
    diis: number;
    public: number;
  };
}

const segments = [
  { key: 'promoters', label: 'Promoters', color: '#2563eb' },
  { key: 'fiis', label: 'FIIs', color: '#16a34a' },
  { key: 'diis', label: 'DIIs', color: '#d97706' },
  { key: 'public', label: 'Public', color: '#64748b' },
] as const;

export function ShareholdingBar({ data }: ShareholdingBarProps) {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', overflow: 'hidden', height: 34, borderRadius: 2, bgcolor: 'action.hover' }}>
        {segments.map((segment) => (
          <Tooltip key={segment.key} title={`${segment.label}: ${data[segment.key]}%`}>
            <Box sx={{ width: `${data[segment.key]}%`, bgcolor: segment.color, transition: 'width 500ms ease' }} />
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {segments.map((segment) => (
          <Stack key={segment.key} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
            <Typography variant="body2">
              {segment.label} {data[segment.key]}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

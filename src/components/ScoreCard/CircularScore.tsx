import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { getScoreTone, toneColor } from '../../utils/format';

interface CircularScoreProps {
  score: number;
  rating: string;
  size?: number;
}

export function CircularScore({ score, rating, size = 150 }: CircularScoreProps) {
  const color = toneColor(getScoreTone(score));

  return (
    <Stack alignItems="center" spacing={1}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={3.8}
          sx={{ color: 'action.hover', position: 'absolute', inset: 0 }}
        />
        <CircularProgress variant="determinate" value={score} size={size} thickness={3.8} sx={{ color, transition: 'all 600ms ease' }} />
        <Box sx={{ inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" spacing={0.25}>
            <Typography variant="h4">{score.toFixed(1)}</Typography>
            <Typography variant="caption" color="text.secondary">
              / 100
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Typography variant="subtitle1" sx={{ color }}>
        {rating}
      </Typography>
    </Stack>
  );
}

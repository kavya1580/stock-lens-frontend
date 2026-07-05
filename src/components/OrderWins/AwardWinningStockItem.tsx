import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Card, CardContent, Chip, Link, Stack, TableCell, TableRow, Typography } from '@mui/material';
import type { AwardWinningStock } from '../../types/stock';

interface AwardWinningStockItemProps {
  stock: AwardWinningStock;
}

function formatScore(score?: number | string): string {
  const numericScore = typeof score === 'string' ? Number.parseFloat(score) : score;
  return typeof numericScore === 'number' && Number.isFinite(numericScore) ? numericScore.toFixed(1) : '—';
}

function displayValue(value?: string | null): string {
  const text = value?.trim();
  return text && text !== '—' ? text : '—';
}

function scoreTone(score?: number | string): 'success' | 'primary' | 'warning' | 'error' {
  const numericScore = typeof score === 'string' ? Number.parseFloat(score) : score;

  if (typeof numericScore !== 'number' || !Number.isFinite(numericScore)) {
    return 'warning';
  }

  if (numericScore >= 85) {
    return 'success';
  }

  if (numericScore >= 70) {
    return 'primary';
  }

  if (numericScore >= 55) {
    return 'warning';
  }

  return 'error';
}

function ratingTone(rating?: string | null): 'success' | 'primary' | 'warning' | 'error' {
  const normalized = rating?.trim().toLowerCase() || '';

  if (normalized.includes('excellent') || normalized.includes('strong')) {
    return 'success';
  }

  if (normalized.includes('good') || normalized.includes('fair')) {
    return 'primary';
  }

  if (normalized.includes('average') || normalized.includes('watch')) {
    return 'warning';
  }

  return 'error';
}

function formatAnnouncementDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function AwardWinningStockTableRow({ stock }: AwardWinningStockItemProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 240 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {stock.companyName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {displayValue(stock.announcementHeadline)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontWeight: 700, letterSpacing: 0.3 }}>{stock.symbol}</Typography>
      </TableCell>
      <TableCell>{displayValue(stock.orderFromWho)}</TableCell>
      <TableCell>{displayValue(stock.orderAmount)}</TableCell>
      <TableCell>{displayValue(stock.marketCap)}</TableCell>
      <TableCell>
        <Chip size="small" label={formatScore(stock.fundamentalScore)} color={scoreTone(stock.fundamentalScore)} variant="filled" />
      </TableCell>
      <TableCell>
        <Chip size="small" label={displayValue(stock.rating)} color={ratingTone(stock.rating)} variant="outlined" />
      </TableCell>
      <TableCell>{formatAnnouncementDate(stock.announcementDate)}</TableCell>
      <TableCell>
        {stock.sourceUrl ? (
          <Link href={stock.sourceUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            View Source
            <OpenInNewIcon fontSize="inherit" />
          </Link>
        ) : (
          '—'
        )}
      </TableCell>
    </TableRow>
  );
}

export function AwardWinningStockCard({ stock }: AwardWinningStockItemProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {stock.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stock.symbol}
              </Typography>
            </Box>
            <Chip size="small" label={formatScore(stock.fundamentalScore)} color={scoreTone(stock.fundamentalScore)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Order From:</strong> {displayValue(stock.orderFromWho)}
            </Typography>
            <Typography variant="body2">
              <strong>Order Amount:</strong> {displayValue(stock.orderAmount)}
            </Typography>
            <Typography variant="body2">
              <strong>Market Cap:</strong> {displayValue(stock.marketCap)}
            </Typography>
            <Typography variant="body2">
              <strong>Rating:</strong>{' '}
              <Chip size="small" label={displayValue(stock.rating)} color={ratingTone(stock.rating)} variant="outlined" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Date:</strong> {formatAnnouncementDate(stock.announcementDate)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {displayValue(stock.announcementHeadline)}
          </Typography>

          {stock.sourceUrl ? (
            <Link href={stock.sourceUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, width: 'fit-content' }}>
              View Source
              <OpenInNewIcon fontSize="inherit" />
            </Link>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
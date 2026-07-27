import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Card, CardContent, Chip, Link, Stack, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import type { AnnouncedResultStock } from '../../types/stock';

interface AnnouncedResultItemProps {
  stock: AnnouncedResultStock;
}

const COMPARISON_TOOLTIP =
  'Latest quarter vs. this company\'s own trailing profit trend — not a real analyst/street estimate.';

function formatScore(score?: number | string): string {
  const numericScore = typeof score === 'string' ? Number.parseFloat(score) : score;
  return typeof numericScore === 'number' && Number.isFinite(numericScore) ? numericScore.toFixed(1) : '—';
}

function formatPercent(value?: number | string): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof numericValue === 'number' && Number.isFinite(numericValue) ? `${numericValue.toFixed(1)}%` : '—';
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

  if (numericScore >= 85) return 'success';
  if (numericScore >= 70) return 'primary';
  if (numericScore >= 55) return 'warning';
  return 'error';
}

function ratingTone(rating?: string | null): 'success' | 'primary' | 'warning' | 'error' {
  const normalized = rating?.trim().toLowerCase() || '';

  if (normalized.includes('excellent') || normalized.includes('strong')) return 'success';
  if (normalized.includes('good') || normalized.includes('fair')) return 'primary';
  if (normalized.includes('average') || normalized.includes('watch')) return 'warning';
  return 'error';
}

function comparisonTone(value?: string | null): 'success' | 'primary' | 'warning' | 'error' | 'default' {
  const normalized = value?.trim().toLowerCase() || '';

  if (normalized === 'beat trend') return 'success';
  if (normalized === 'in line') return 'primary';
  if (normalized === 'below trend') return 'error';
  return 'default';
}

export function AnnouncedResultTableRow({ stock }: AnnouncedResultItemProps) {
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
      <TableCell>{displayValue(stock.latestQuarterNetProfit)}</TableCell>
      <TableCell>{formatPercent(stock.qoqProfitGrowthPercent)}</TableCell>
      <TableCell>{formatPercent(stock.yoyProfitGrowthPercent)}</TableCell>
      <TableCell>
        <Chip size="small" label={formatScore(stock.fundamentalScore)} color={scoreTone(stock.fundamentalScore)} variant="filled" />
      </TableCell>
      <TableCell>
        <Chip size="small" label={displayValue(stock.rating)} color={ratingTone(stock.rating)} variant="outlined" />
      </TableCell>
      <TableCell>
        <Tooltip title={COMPARISON_TOOLTIP}>
          <Chip size="small" label={displayValue(stock.actualVsExpected)} color={comparisonTone(stock.actualVsExpected)} variant="outlined" />
        </Tooltip>
      </TableCell>
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

export function AnnouncedResultCard({ stock }: AnnouncedResultItemProps) {
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
              <strong>Latest Qtr Net Profit:</strong> {displayValue(stock.latestQuarterNetProfit)} ({formatPercent(stock.qoqProfitGrowthPercent)} QoQ, {formatPercent(stock.yoyProfitGrowthPercent)} YoY)
            </Typography>
            <Typography variant="body2">
              <strong>Latest Qtr Sales:</strong> {displayValue(stock.latestQuarterSales)}
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Rating:</strong>{' '}
              <Chip size="small" label={displayValue(stock.rating)} color={ratingTone(stock.rating)} variant="outlined" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body2" component="div">
              <Tooltip title={COMPARISON_TOOLTIP}>
                <span>
                  <strong>vs. Trend:</strong>{' '}
                  <Chip size="small" label={displayValue(stock.actualVsExpected)} color={comparisonTone(stock.actualVsExpected)} variant="outlined" sx={{ ml: 1 }} />
                </span>
              </Tooltip>
            </Typography>
            {stock.note ? (
              <Typography variant="caption" color="text.secondary">
                {stock.note}
              </Typography>
            ) : null}
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

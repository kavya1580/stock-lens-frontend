import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CardContent, Grid, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AwardWinningStockCard, AwardWinningStockTableRow } from '../../components/OrderWins/AwardWinningStockItem';
import { getAwardWinningStocks, getAwardWinningStocksProgress } from '../../services/stockApi';
import type { AwardWinningStock, AwardWinningStocksEnrichmentProgress, AwardWinningStocksQuery } from '../../types/stock';

const PROGRESS_POLL_MS = 600;

interface OrderWinsFilters {
  pageno: number;
  prevDate: string;
  toDate: string;
  search: string;
}

interface LoadedPageInfo {
  pageNo: number;
  totalPages: number | null;
  totalCount: number | null;
}

const getTodayInputValue = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const createDefaultFilters = (): OrderWinsFilters => ({
  pageno: 1,
  prevDate: getTodayInputValue(-5),
  toDate: getTodayInputValue(0),
  search: 'P',
});

function normaliseFilters(filters: OrderWinsFilters): OrderWinsFilters {
  return {
    pageno: Number.isFinite(filters.pageno) && filters.pageno > 0 ? Math.floor(filters.pageno) : 1,
    prevDate: filters.prevDate,
    toDate: filters.toDate,
    search: filters.search,
  };
}

function scoreValue(stock: AwardWinningStock): number {
  const value = stock.fundamentalScore;
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : -1;
}

function sortStocks(stocks: AwardWinningStock[], direction: 'desc' | 'asc') {
  return [...stocks].sort((left, right) => {
    const difference = scoreValue(left) - scoreValue(right);
    return direction === 'desc' ? -difference : difference;
  });
}

function queryFromFilters(filters: OrderWinsFilters): AwardWinningStocksQuery {
  return {
    pageno: filters.pageno,
    prevDate: filters.prevDate,
    toDate: filters.toDate,
    search: filters.search,
  };
}

export function OrderWinsPage() {
  const theme = useTheme();
  const [filters, setFilters] = useState<OrderWinsFilters>(createDefaultFilters);
  const [stocks, setStocks] = useState<AwardWinningStock[]>([]);
  const [pageInfo, setPageInfo] = useState<LoadedPageInfo>({ pageNo: 1, totalPages: null, totalCount: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [progress, setProgress] = useState<AwardWinningStocksEnrichmentProgress | null>(null);
  const requestIdRef = useRef(0);
  const progressIntervalRef = useRef<number | null>(null);

  const stopProgressPolling = () => {
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startProgressPolling = () => {
    stopProgressPolling();
    setProgress(null);
    progressIntervalRef.current = window.setInterval(() => {
      void getAwardWinningStocksProgress()
        .then((snapshot) => {
          if (snapshot.total > 0) {
            setProgress(snapshot);
          }
        })
        .catch(() => {
          // Best-effort only — a missed poll tick just means the indicator doesn't update this cycle.
        });
    }, PROGRESS_POLL_MS);
  };

  useEffect(() => stopProgressPolling, []);

  const loadStocks = async (nextFilters: OrderWinsFilters) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);
    startProgressPolling();

    try {
      const response = await getAwardWinningStocks(queryFromFilters(normaliseFilters(nextFilters)));
      if (requestIdRef.current !== requestId) {
        return;
      }

      setStocks(response.items);
      setPageInfo({
        pageNo: response.pageNo,
        totalPages: typeof response.totalPages === 'number' ? response.totalPages : null,
        totalCount: typeof response.totalCount === 'number' ? response.totalCount : null,
      });
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(err instanceof Error ? err.message : 'Unable to fetch award winning stocks.');
      setStocks([]);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
        stopProgressPolling();
      }
    }
  };

  useEffect(() => {
    void loadStocks(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedStocks = useMemo(() => sortStocks(stocks, sortDirection), [stocks, sortDirection]);

  const handleFieldChange = (field: keyof OrderWinsFilters) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilters((current) => ({
      ...current,
      [field]: field === 'pageno' ? (value === '' ? NaN : Number.parseInt(value, 10)) : value,
    }));
  };

  const handleFetch = () => {
    void loadStocks(filters);
  };

  const shiftPage = (delta: number) => {
    const nextPage = Math.max(1, (filters.pageno || 1) + delta);
    const nextFilters = { ...filters, pageno: nextPage };
    setFilters(nextFilters);
    void loadStocks(nextFilters);
  };

  const canGoNext = pageInfo.totalPages ? pageInfo.pageNo < pageInfo.totalPages : true;
  const isEmpty = !isLoading && !error && sortedStocks.length === 0;
  const loadingLabel =
    progress && progress.total > 0
      ? `Enriching ${progress.completed} of ${progress.total} companies...`
      : 'Loading award winning stocks...';
  const loadingProgressPercent = progress && progress.total > 0 ? (progress.completed / progress.total) * 100 : null;

  return (
    <Stack spacing={2.5}>
      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, transparent 44%)`,
        }}
      >
        <CardContent>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography variant="h5">Award Winning Stocks</Typography>
              <Typography color="text.secondary">
                Track BSE order announcements, contract wins, and government order flow.
              </Typography>
            </Stack>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth label="Page No" type="number" value={Number.isNaN(filters.pageno) ? '' : filters.pageno} onChange={handleFieldChange('pageno')} inputProps={{ min: 1 }} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Prev Date" type="date" value={filters.prevDate} onChange={handleFieldChange('prevDate')} size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="To Date" type="date" value={filters.toDate} onChange={handleFieldChange('toDate')} size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Search" value={filters.search} onChange={handleFieldChange('search')} size="small" placeholder="Search company or symbol" />
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<SearchIcon />} onClick={handleFetch}>
                  Fetch
                </Button>
                <Button variant="outlined" onClick={() => shiftPage(-1)} disabled={filters.pageno <= 1 || isLoading}>
                  Previous
                </Button>
                <Button variant="outlined" onClick={() => shiftPage(1)} disabled={!canGoNext || isLoading}>
                  Next
                </Button>
                <Button variant="text" startIcon={<RefreshIcon />} onClick={handleFetch} disabled={isLoading}>
                  Refresh
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary">
                  Current page: {pageInfo.pageNo}
                </Typography>
                {typeof pageInfo.totalPages === 'number' ? (
                  <Typography variant="body2" color="text.secondary">
                    / {pageInfo.totalPages}
                  </Typography>
                ) : null}
                {typeof pageInfo.totalCount === 'number' ? (
                  <Typography variant="body2" color="text.secondary">
                    • {pageInfo.totalCount} items
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">{loadingLabel}</Typography>
              {loadingProgressPercent !== null ? (
                <LinearProgress variant="determinate" value={loadingProgressPercent} />
              ) : (
                <LinearProgress />
              )}
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Box sx={{ height: 22, width: '55%', bgcolor: 'action.hover', borderRadius: 1 }} />
                        <Box sx={{ height: 16, width: '35%', bgcolor: 'action.hover', borderRadius: 1 }} />
                        <Box sx={{ height: 14, width: '85%', bgcolor: 'action.hover', borderRadius: 1 }} />
                        <Box sx={{ height: 14, width: '70%', bgcolor: 'action.hover', borderRadius: 1 }} />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card variant="outlined" sx={{ borderColor: 'error.light' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" color="error.main">
                Unable to load awards feed
              </Typography>
              <Typography color="text.secondary">{error}</Typography>
              <Box>
                <Button variant="contained" color="error" startIcon={<RefreshIcon />} onClick={handleFetch}>
                  Retry
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {isEmpty ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="h6">No award winning stocks found</Typography>
              <Typography color="text.secondary">Try widening the date range or adjusting the search keyword.</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && sortedStocks.length > 0 ? (
        <Stack spacing={2}>
          <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Order From</TableCell>
                    <TableCell>Order Amount</TableCell>
                    <TableCell>Market Cap</TableCell>
                    <TableCell>
                      <TableSortLabel active direction={sortDirection} onClick={() => setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))}>
                        Fundamental Score
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Announcement Date</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <AwardWinningStockTableRow key={`${stock.symbol}-${stock.announcementDate || stock.companyName}`} stock={stock} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Stocks</Typography>
                <Button size="small" variant="outlined" onClick={() => setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))}>
                  Sort {sortDirection === 'desc' ? 'Descending' : 'Ascending'}
                </Button>
              </Stack>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr' }}>
                {sortedStocks.map((stock) => (
                  <AwardWinningStockCard key={`${stock.symbol}-${stock.announcementDate || stock.companyName}`} stock={stock} />
                ))}
              </Box>
            </Stack>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );
}
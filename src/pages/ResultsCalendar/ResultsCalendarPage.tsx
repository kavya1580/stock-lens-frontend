import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AnnouncedResultCard, AnnouncedResultTableRow } from '../../components/ResultsCalendar/AnnouncedResultItem';
import { getAnnouncedResults, getAnnouncedResultsProgress } from '../../services/stockApi';
import type { AnnouncedResultStock, AnnouncedResultsEnrichmentProgress, ResultsCalendarQuery } from '../../types/stock';

type LookbackDays = 1 | 2;

interface ResultsFilters {
  pageno: number;
  lookbackDays: LookbackDays;
}

interface LoadedPageInfo {
  pageNo: number;
  totalPages: number | null;
  totalCount: number | null;
}

const PROGRESS_POLL_MS = 600;

const createDefaultFilters = (): ResultsFilters => ({
  pageno: 1,
  lookbackDays: 2,
});

function normaliseFilters(filters: ResultsFilters): ResultsFilters {
  return {
    pageno: Number.isFinite(filters.pageno) && filters.pageno > 0 ? Math.floor(filters.pageno) : 1,
    lookbackDays: filters.lookbackDays === 1 ? 1 : 2,
  };
}

function queryFromFilters(filters: ResultsFilters): ResultsCalendarQuery {
  return {
    pageno: filters.pageno,
    lookbackDays: filters.lookbackDays,
  };
}

// Screener's own feed is ordered by filing/recency, which has nothing to do with company quality.
// Sort best-to-worst by Fundamental Score instead — same convention as OrderWinsPage's score sort.
// Missing/unresolved scores ("Insufficient Data") sink to the bottom rather than sorting arbitrarily.
function scoreValue(score?: number | string): number {
  const numeric = typeof score === 'string' ? Number.parseFloat(score) : score;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : -1;
}

export function ResultsCalendarPage() {
  const theme = useTheme();
  const [filters, setFilters] = useState<ResultsFilters>(createDefaultFilters);
  const [announcedStocks, setAnnouncedStocks] = useState<AnnouncedResultStock[]>([]);
  const [pageInfo, setPageInfo] = useState<LoadedPageInfo>({ pageNo: 1, totalPages: null, totalCount: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<AnnouncedResultsEnrichmentProgress | null>(null);
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
      void getAnnouncedResultsProgress()
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

  const loadStocks = async (nextFilters: ResultsFilters) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);
    startProgressPolling();

    try {
      const query = queryFromFilters(normaliseFilters(nextFilters));
      const response = await getAnnouncedResults(query);
      if (requestIdRef.current !== requestId) return;
      setAnnouncedStocks(response.items);
      setPageInfo({
        pageNo: response.pageNo,
        totalPages: typeof response.totalPages === 'number' ? response.totalPages : null,
        totalCount: typeof response.totalCount === 'number' ? response.totalCount : null,
      });
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : 'Unable to fetch results calendar.');
      setAnnouncedStocks([]);
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

  const handlePageNoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilters((current) => ({
      ...current,
      pageno: value === '' ? NaN : Number.parseInt(value, 10),
    }));
  };

  const handleFetch = () => {
    void loadStocks(filters);
  };

  const handleLookbackChange = (_: unknown, nextLookback: LookbackDays | null) => {
    if (!nextLookback || nextLookback === filters.lookbackDays) return;
    const nextFilters = { ...filters, lookbackDays: nextLookback, pageno: 1 };
    setFilters(nextFilters);
    void loadStocks(nextFilters);
  };

  const shiftPage = (delta: number) => {
    const nextPage = Math.max(1, (filters.pageno || 1) + delta);
    const nextFilters = { ...filters, pageno: nextPage };
    setFilters(nextFilters);
    void loadStocks(nextFilters);
  };

  const canGoNext = pageInfo.totalPages ? pageInfo.pageNo < pageInfo.totalPages : true;

  const sortedAnnouncedStocks = useMemo(
    () => [...announcedStocks].sort((a, b) => scoreValue(b.fundamentalScore) - scoreValue(a.fundamentalScore)),
    [announcedStocks],
  );

  const isEmpty = !isLoading && !error && sortedAnnouncedStocks.length === 0;
  const loadingLabel =
    progress && progress.total > 0
      ? `Enriching ${progress.completed} of ${progress.total} companies...`
      : 'Loading results calendar...';
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
              <Typography variant="h5">Results Calendar</Typography>
              <Typography color="text.secondary">
                Recently announced results vs. each company's own trailing profit trend. "Expected" here is an
                in-house heuristic — not a real analyst/street estimate.
              </Typography>
            </Stack>

            <Grid
              container
              spacing={2}
              alignItems="flex-end"
              sx={{ '& .MuiGrid-item': { paddingTop: 0, paddingLeft: 0 } }}
            >
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Lookback window
                  </Typography>
                  <ToggleButtonGroup value={filters.lookbackDays} exclusive onChange={handleLookbackChange} color="primary" size="small">
                    <ToggleButton value={1}>Today only</ToggleButton>
                    <ToggleButton value={2}>Today + yesterday</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth label="Page No" type="number" value={Number.isNaN(filters.pageno) ? '' : filters.pageno} onChange={handlePageNoChange} inputProps={{ min: 1 }} size="small" />
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
                Unable to load results calendar
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
              <Typography variant="h6">No recently announced results found</Typography>
              <Typography color="text.secondary">
                Try widening the lookback window to include yesterday, or check back after today's results are filed.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && sortedAnnouncedStocks.length > 0 ? (
        <Stack spacing={2}>
          <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Latest Qtr Net Profit</TableCell>
                    <TableCell>QoQ Growth</TableCell>
                    <TableCell>YoY Growth</TableCell>
                    <TableCell>Fundamental Score</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>vs. Trend</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAnnouncedStocks.map((stock) => (
                    <AnnouncedResultTableRow key={`${stock.symbol}-${stock.resultDate || stock.companyName}`} stock={stock} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">Stocks</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr' }}>
                {sortedAnnouncedStocks.map((stock) => (
                  <AnnouncedResultCard key={`${stock.symbol}-${stock.resultDate || stock.companyName}`} stock={stock} />
                ))}
              </Box>
            </Stack>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );
}

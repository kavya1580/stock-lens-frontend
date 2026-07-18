import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
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
import { UpcomingResultCard, UpcomingResultTableRow } from '../../components/ResultsCalendar/UpcomingResultItem';
import { getAnnouncedResults, getUpcomingResults } from '../../services/stockApi';
import type { AnnouncedResultStock, ResultsCalendarQuery, UpcomingResultStock } from '../../types/stock';

type ResultsMode = 'upcoming' | 'announced';

interface ResultsFilters {
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

const createDefaultFilters = (): ResultsFilters => ({
  pageno: 1,
  prevDate: getTodayInputValue(-7),
  toDate: getTodayInputValue(7),
  search: 'P',
});

function normaliseFilters(filters: ResultsFilters): ResultsFilters {
  return {
    pageno: Number.isFinite(filters.pageno) && filters.pageno > 0 ? Math.floor(filters.pageno) : 1,
    prevDate: filters.prevDate,
    toDate: filters.toDate,
    search: filters.search,
  };
}

function queryFromFilters(filters: ResultsFilters): ResultsCalendarQuery {
  return {
    pageno: filters.pageno,
    prevDate: filters.prevDate,
    toDate: filters.toDate,
    search: filters.search,
  };
}

// BSE's feed itself is ordered by filing timestamp, which has nothing to do with company quality.
// Sort best-to-worst by Fundamental Score instead — same convention as OrderWinsPage's score sort.
// Missing/unresolved scores ("Insufficient Data") sink to the bottom rather than sorting arbitrarily.
function scoreValue(score?: number | string): number {
  const numeric = typeof score === 'string' ? Number.parseFloat(score) : score;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : -1;
}

export function ResultsCalendarPage() {
  const theme = useTheme();
  const [mode, setMode] = useState<ResultsMode>('upcoming');
  const [filters, setFilters] = useState<ResultsFilters>(createDefaultFilters);
  const [upcomingStocks, setUpcomingStocks] = useState<UpcomingResultStock[]>([]);
  const [announcedStocks, setAnnouncedStocks] = useState<AnnouncedResultStock[]>([]);
  const [pageInfo, setPageInfo] = useState<LoadedPageInfo>({ pageNo: 1, totalPages: null, totalCount: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadStocks = async (nextMode: ResultsMode, nextFilters: ResultsFilters) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const query = queryFromFilters(normaliseFilters(nextFilters));
      if (nextMode === 'upcoming') {
        const response = await getUpcomingResults(query);
        if (requestIdRef.current !== requestId) return;
        setUpcomingStocks(response.items);
        setPageInfo({
          pageNo: response.pageNo,
          totalPages: typeof response.totalPages === 'number' ? response.totalPages : null,
          totalCount: typeof response.totalCount === 'number' ? response.totalCount : null,
        });
      } else {
        const response = await getAnnouncedResults(query);
        if (requestIdRef.current !== requestId) return;
        setAnnouncedStocks(response.items);
        setPageInfo({
          pageNo: response.pageNo,
          totalPages: typeof response.totalPages === 'number' ? response.totalPages : null,
          totalCount: typeof response.totalCount === 'number' ? response.totalCount : null,
        });
      }
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : 'Unable to fetch results calendar.');
      if (nextMode === 'upcoming') {
        setUpcomingStocks([]);
      } else {
        setAnnouncedStocks([]);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadStocks(mode, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFieldChange = (field: keyof ResultsFilters) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilters((current) => ({
      ...current,
      [field]: field === 'pageno' ? (value === '' ? NaN : Number.parseInt(value, 10)) : value,
    }));
  };

  const handleFetch = () => {
    void loadStocks(mode, filters);
  };

  const handleModeChange = (_: unknown, nextMode: ResultsMode | null) => {
    if (!nextMode || nextMode === mode) return;
    setMode(nextMode);
  };

  const shiftPage = (delta: number) => {
    const nextPage = Math.max(1, (filters.pageno || 1) + delta);
    const nextFilters = { ...filters, pageno: nextPage };
    setFilters(nextFilters);
    void loadStocks(mode, nextFilters);
  };

  const canGoNext = pageInfo.totalPages ? pageInfo.pageNo < pageInfo.totalPages : true;

  const sortedUpcomingStocks = useMemo(
    () => [...upcomingStocks].sort((a, b) => scoreValue(b.fundamentalScore) - scoreValue(a.fundamentalScore)),
    [upcomingStocks],
  );
  const sortedAnnouncedStocks = useMemo(
    () => [...announcedStocks].sort((a, b) => scoreValue(b.fundamentalScore) - scoreValue(a.fundamentalScore)),
    [announcedStocks],
  );

  const stocks = mode === 'upcoming' ? sortedUpcomingStocks : sortedAnnouncedStocks;
  const isEmpty = !isLoading && !error && stocks.length === 0;

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
                Board-meeting intimations for upcoming results, and recently announced results vs. each company's own
                trailing profit trend. "Expected" here is an in-house heuristic — not a real analyst/street estimate.
              </Typography>
            </Stack>

            <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} color="primary" size="small">
              <ToggleButton value="upcoming">Upcoming</ToggleButton>
              <ToggleButton value="announced">Recently Announced</ToggleButton>
            </ToggleButtonGroup>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Prev Date" type="date" value={filters.prevDate} onChange={handleFieldChange('prevDate')} size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="To Date" type="date" value={filters.toDate} onChange={handleFieldChange('toDate')} size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Search" value={filters.search} onChange={handleFieldChange('search')} size="small" placeholder="Search company or symbol" />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth label="Page No" type="number" value={Number.isNaN(filters.pageno) ? '' : filters.pageno} onChange={handleFieldChange('pageno')} inputProps={{ min: 1 }} size="small" />
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
              <Typography variant="h6">Loading results calendar...</Typography>
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
              <Typography variant="h6">No {mode === 'upcoming' ? 'upcoming' : 'recently announced'} results found</Typography>
              <Typography color="text.secondary">Try widening the date range or adjusting the search keyword.</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && stocks.length > 0 ? (
        <Stack spacing={2}>
          <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer>
              {mode === 'upcoming' ? (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Board Meeting Date</TableCell>
                      <TableCell>Market Cap</TableCell>
                      <TableCell>Fundamental Score</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Expected</TableCell>
                      <TableCell>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedUpcomingStocks.map((stock) => (
                      <UpcomingResultTableRow key={`${stock.symbol}-${stock.announcementDate || stock.companyName}`} stock={stock} />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Latest Qtr Net Profit</TableCell>
                      <TableCell>QoQ Growth</TableCell>
                      <TableCell>Fundamental Score</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>vs. Trend</TableCell>
                      <TableCell>Result Date</TableCell>
                      <TableCell>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAnnouncedStocks.map((stock) => (
                      <AnnouncedResultTableRow key={`${stock.symbol}-${stock.resultDate || stock.companyName}`} stock={stock} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Card>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">Stocks</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr' }}>
                {mode === 'upcoming'
                  ? sortedUpcomingStocks.map((stock) => (
                      <UpcomingResultCard key={`${stock.symbol}-${stock.announcementDate || stock.companyName}`} stock={stock} />
                    ))
                  : sortedAnnouncedStocks.map((stock) => (
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

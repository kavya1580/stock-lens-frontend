import { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { getStockNews } from '../../services/stockApi';
import type { StockNewsItem } from '../../types/stock';

interface NewsTabProps {
  symbol: string;
}

function formatPublishedAt(publishedAt: string): string {
  const parsed = new Date(publishedAt);
  return Number.isNaN(parsed.getTime()) ? publishedAt : parsed.toLocaleString();
}

export function NewsTab({ symbol }: NewsTabProps) {
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setNews([]);
    setError(null);
    setIsLoading(true);

    getStockNews(symbol)
      .then((result) => {
        if (!cancelled) setNews(result);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load news for this stock. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5">News</Typography>
        <Typography color="text.secondary">
          Recent headlines for this stock, via Google News.
        </Typography>
      </Stack>

      {isLoading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading news…</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : news.length === 0 ? (
        <Typography color="text.secondary">No recent news found for this stock.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {news.map((item) => (
            <Card variant="outlined" key={item.link}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" underline="hover">
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.title}
                    </Typography>
                  </Link>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={item.source} />
                    <Typography variant="caption" color="text.secondary">
                      {formatPublishedAt(item.publishedAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

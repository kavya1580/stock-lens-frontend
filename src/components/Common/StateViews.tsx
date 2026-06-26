import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="42%" height={48} />
            <Skeleton variant="rounded" height={118} />
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Skeleton variant="rounded" height={128} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" startIcon={<RefreshIcon />} onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}

export function EmptyState() {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5">Enter a stock symbol to begin analysis.</Typography>
      <Typography color="text.secondary">StockLens analyzes one company at a time.</Typography>
    </Box>
  );
}

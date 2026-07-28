import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsightsIcon from '@mui/icons-material/Insights';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ShieldIcon from '@mui/icons-material/Shield';

const content = [
  ['News Sentiment', 'Upcoming Feature', NewspaperIcon],
  ['Insider Trading', 'Upcoming Feature', ShieldIcon],
  ['Mutual Fund Holdings', 'Upcoming Feature', BusinessCenterIcon],
  ['Institutional Activity', 'Upcoming Feature', InsightsIcon],
  ['Quarterly Comparison', 'Upcoming Feature', QueryStatsIcon],
  ['Annual Reports', 'Upcoming Feature', NewspaperIcon],
  ['Dividend History', 'Upcoming Feature', CalendarMonthIcon],
] as const;

export function PlaceholderTab() {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5">More</Typography>
        <Typography color="text.secondary">Additional research workflows planned for deeper investigation.</Typography>
      </Stack>
      <Grid container spacing={2}>
        {content.map(([label, status, Icon]) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Icon color="primary" fontSize="large" />
                  <Stack spacing={0.5}>
                    <Typography variant="h6">{label}</Typography>
                    <Typography color="text.secondary">{status}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

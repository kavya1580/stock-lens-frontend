import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsightsIcon from '@mui/icons-material/Insights';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ShieldIcon from '@mui/icons-material/Shield';

interface PlaceholderTabsProps {
  type: 'ai' | 'orders' | 'more';
}

const content = {
  ai: [
    ['Overall AI Opinion', 'Coming Soon', AutoAwesomeIcon],
    ['Business Quality', 'Coming Soon', InsightsIcon],
    ['Risks', 'Coming Soon', ShieldIcon],
    ['Competitive Advantage', 'Coming Soon', BusinessCenterIcon],
    ['Earnings Summary', 'Coming Soon', NewspaperIcon],
    ['AI Chat', 'Coming Soon', QueryStatsIcon],
  ],
  orders: [
    ['Company announcements', 'Future integration', CampaignIcon],
    ['Order wins', 'Future integration', BusinessCenterIcon],
    ['New contracts', 'Future integration', InsightsIcon],
    ['Government tenders', 'Future integration', NewspaperIcon],
    ['Capex announcements', 'Future integration', CalendarMonthIcon],
  ],
  more: [
    ['News Sentiment', 'Upcoming Feature', NewspaperIcon],
    ['Insider Trading', 'Upcoming Feature', ShieldIcon],
    ['Mutual Fund Holdings', 'Upcoming Feature', BusinessCenterIcon],
    ['Institutional Activity', 'Upcoming Feature', InsightsIcon],
    ['Quarterly Comparison', 'Upcoming Feature', QueryStatsIcon],
    ['Annual Reports', 'Upcoming Feature', NewspaperIcon],
    ['Dividend History', 'Upcoming Feature', CalendarMonthIcon],
    ['Earnings Calendar', 'Upcoming Feature', CalendarMonthIcon],
  ],
};

const headings = {
  ai: ['AI Analysis', 'Premium research intelligence modules are staged for a future release.'],
  orders: ['Order Wins', 'Track announcements, contracts, tenders, and capex signals in a future release.'],
  more: ['More', 'Additional research workflows planned for deeper investigation.'],
};

export function PlaceholderTab({ type }: PlaceholderTabsProps) {
  const [title, subtitle] = headings[type];

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Stack>
      <Grid container spacing={2}>
        {content[type].map(([label, status, Icon]) => (
          <Grid item xs={12} sm={6} md={4} key={label as string}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Icon color="primary" fontSize="large" />
                  <Stack spacing={0.5}>
                    <Typography variant="h6">{label as string}</Typography>
                    <Typography color="text.secondary">{status as string}</Typography>
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

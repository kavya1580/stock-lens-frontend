import { Container, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { CompanyHeader } from '../../components/Header/CompanyHeader';
import { DashboardTabs } from '../../components/Tabs/DashboardTabs';
import { DashboardSkeleton, EmptyState, ErrorState } from '../../components/Common/StateViews';
import { FundamentalsTab } from '../../components/Fundamentals/FundamentalsTab';
import { TechnicalTab } from '../../components/Technical/TechnicalTab';
import { AiAnalysisTab } from '../../components/AI/AiAnalysisTab';
import { NewsTab } from '../../components/News/NewsTab';
import { PlaceholderTab } from '../../components/Placeholders/PlaceholderTabs';
import { ResultsCalendarPage } from '../ResultsCalendar/ResultsCalendarPage';
import type { StockBundle } from '../../types/stock';

interface StockDashboardProps {
  data: StockBundle | null;
  isLoading: boolean;
  error: string | null;
  symbol: string;
  onRetry: () => void;
}

export function StockDashboard({ data, isLoading, error, symbol, onRetry }: StockDashboardProps) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setActiveTab(0);
  }, [symbol]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {isLoading ? <DashboardSkeleton /> : null}
      {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {!isLoading && !error && !data ? <EmptyState /> : null}
      {!isLoading && !error && data ? (
        <Stack spacing={2}>
          <CompanyHeader fundamentals={data.fundamentals} score={data.score} isDemo={data.isDemo} />
          <DashboardTabs value={activeTab} onChange={setActiveTab} />
          {activeTab === 0 ? <FundamentalsTab fundamentals={data.fundamentals} score={data.score} /> : null}
          {activeTab === 1 ? <TechnicalTab indicators={data.indicators} /> : null}
          {activeTab === 2 ? <AiAnalysisTab symbol={symbol} /> : null}
          {activeTab === 3 ? <PlaceholderTab type="orders" /> : null}
          {activeTab === 4 ? <ResultsCalendarPage /> : null}
          {activeTab === 5 ? <NewsTab symbol={symbol} /> : null}
          {activeTab === 6 ? <PlaceholderTab type="more" /> : null}
        </Stack>
      ) : null}
    </Container>
  );
}

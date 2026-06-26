import { Box, Tab, Tabs } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface DashboardTabsProps {
  value: number;
  onChange: (value: number) => void;
}

const tabs = [
  { label: 'Fundamentals', icon: <AccountBalanceIcon /> },
  { label: 'Technical Analysis', icon: <AutoGraphIcon /> },
  { label: 'AI Analysis', icon: <PsychologyIcon /> },
  { label: 'Order Wins', icon: <ReceiptLongIcon /> },
  { label: 'More', icon: <MoreHorizIcon /> },
];

export function DashboardTabs({ value, onChange }: DashboardTabsProps) {
  return (
    <Box sx={{ position: 'sticky', top: { xs: 132, md: 72 }, zIndex: 5, bgcolor: 'background.default', py: 1.5 }}>
      <Tabs
        value={value}
        onChange={(_, nextValue: number) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 1,
          minHeight: 54,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          '& .MuiTab-root': { minHeight: 52, fontWeight: 800 },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}

import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LensBlurIcon from '@mui/icons-material/LensBlur';
import { StockSearch } from '../SearchBar/StockSearch';

interface AppHeaderProps {
  symbol: string;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onSearch: (symbol: string) => void;
}

export function AppHeader({ symbol, mode, onToggleMode, onSearch }: AppHeaderProps) {
  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(18px)', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ py: 1.25, gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' } }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 220 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff' }}>
            <LensBlurIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1 }}>
              StockLens
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Deep single-stock analysis
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <StockSearch initialSymbol={symbol} onSearch={onSearch} />
        </Box>
        <IconButton aria-label="toggle theme" onClick={onToggleMode} sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

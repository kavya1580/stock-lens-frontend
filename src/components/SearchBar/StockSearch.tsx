import { FormEvent, useState } from 'react';
import { Button, InputAdornment, Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

interface StockSearchProps {
  initialSymbol: string;
  onSearch: (symbol: string) => void;
}

export function StockSearch({ initialSymbol, onSearch }: StockSearchProps) {
  const [value, setValue] = useState(initialSymbol);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) onSearch(value.trim().toUpperCase());
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 0.75,
        width: { xs: '100%', md: 430 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search symbol: RELIANCE, TCS, BSE"
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ '& fieldset': { border: 0 } }}
      />
      <Button type="submit" variant="contained" startIcon={<TravelExploreIcon />} sx={{ px: 2 }}>
        Analyze
      </Button>
    </Paper>
  );
}

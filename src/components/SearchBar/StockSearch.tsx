import { FormEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, InputAdornment, Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { searchStocks } from '../../services/stockApi';
import type { StockSearchResult } from '../../types/stock';

interface StockSearchProps {
  initialSymbol: string;
  onSearch: (symbol: string) => void;
}

const DEBOUNCE_MS = 250;

export function StockSearch({ initialSymbol, onSearch }: StockSearchProps) {
  const [inputValue, setInputValue] = useState(initialSymbol);
  const [options, setOptions] = useState<StockSearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setInputValue(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    const query = inputValue.trim();
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchStocks(query)
        .then(setOptions)
        .catch(() => setOptions([]));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const submit = (symbol: string) => {
    const trimmed = symbol.trim();
    if (trimmed) onSearch(trimmed.toUpperCase());
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(inputValue);
  };

  const handleOptionSelect = (_event: SyntheticEvent, value: StockSearchResult | string | null) => {
    if (!value) return;
    submit(typeof value === 'string' ? value : value.symbol);
  };

  const filteredOptions = useMemo(() => options, [options]);

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
      <Autocomplete
        freeSolo
        fullWidth
        size="small"
        options={filteredOptions}
        filterOptions={(opts) => opts}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.symbol)}
        isOptionEqualToValue={(option, value) =>
          typeof option !== 'string' && typeof value !== 'string' && option.symbol === value.symbol
        }
        inputValue={inputValue}
        onInputChange={(_event, value) => setInputValue(value)}
        onChange={handleOptionSelect}
        renderOption={(props, option) => (
          <li {...props} key={option.symbol}>
            <strong style={{ marginRight: 8 }}>{option.symbol}</strong>
            <span style={{ color: 'var(--mui-palette-text-secondary)' }}>{option.name}</span>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search by name or symbol: Lloyds, RELIANCE, TCS"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ '& fieldset': { border: 0 } }}
          />
        )}
      />
      <Button type="submit" variant="contained" startIcon={<TravelExploreIcon />} sx={{ px: 2 }}>
        Analyze
      </Button>
    </Paper>
  );
}

import { createTheme } from '@mui/material/styles';

export const makeTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb',
      },
      success: {
        main: '#16a34a',
      },
      warning: {
        main: '#d97706',
      },
      error: {
        main: '#dc2626',
      },
      background: {
        default: mode === 'light' ? '#f6f7f9' : '#0d1117',
        paper: mode === 'light' ? '#ffffff' : '#151b23',
      },
    },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: 0 },
      h2: { fontWeight: 800, letterSpacing: 0 },
      h3: { fontWeight: 800, letterSpacing: 0 },
      h4: { fontWeight: 800, letterSpacing: 0 },
      h5: { fontWeight: 750, letterSpacing: 0 },
      h6: { fontWeight: 750, letterSpacing: 0 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundImage: 'none',
            boxShadow: mode === 'light' ? '0 16px 45px rgba(15, 23, 42, 0.08)' : '0 18px 50px rgba(0, 0, 0, 0.32)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 700,
          },
        },
      },
    },
  });

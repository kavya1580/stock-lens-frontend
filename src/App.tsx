import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo, useState } from "react";
import { AppHeader } from "./components/Header/AppHeader";
import { useStock } from "./hooks/useStock";
import { StockDashboard } from "./pages/StockDashboard/StockDashboard";
import { makeTheme } from "./theme";

export function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const { symbol, data, isLoading, error, loadStock } = useStock("RELIANCE");
  const theme = useMemo(() => makeTheme(mode), [mode]);

  const handleHeaderSearch = (nextSymbol: string) => {
    void loadStock(nextSymbol);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader
        symbol={symbol}
        mode={mode}
        onToggleMode={() =>
          setMode((current) => (current === "light" ? "dark" : "light"))
        }
        onSearch={handleHeaderSearch}
      />
      <StockDashboard
        data={data}
        isLoading={isLoading}
        error={error}
        symbol={symbol}
        onRetry={() => void loadStock(symbol)}
      />
    </ThemeProvider>
  );
}

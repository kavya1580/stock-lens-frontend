import { useCallback, useEffect, useState } from 'react';
import { getStockBundle } from '../services/stockApi';
import type { StockBundle } from '../types/stock';

export function useStock(initialSymbol = 'RELIANCE') {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [data, setData] = useState<StockBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async (nextSymbol: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const bundle = await getStockBundle(nextSymbol);
      setData(bundle);
      setSymbol(nextSymbol.trim().toUpperCase());
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Unable to load stock');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStock(initialSymbol);
  }, [initialSymbol, loadStock]);

  return { symbol, data, isLoading, error, loadStock };
}

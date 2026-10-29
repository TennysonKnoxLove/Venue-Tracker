import { useEffect } from 'react';

export function useBudgetEffects({ fetchCategories, fetchExpenses, fetchSummary }) {
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchSummary();
    // Load once when the page opens. Later filter changes use their own requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

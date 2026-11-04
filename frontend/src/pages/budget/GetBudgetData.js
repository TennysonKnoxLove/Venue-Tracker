import { useCallback, useRef } from 'react';
import { budgetService } from '../../api';

export function useBudgetData({
  filters,
  setLoading,
  setError,
  setExpenses,
  setCategories,
  setSummary,
}) {
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const expenseRequestRef = useRef(0);
  const summaryRequestRef = useRef(0);

  const fetchExpenses = useCallback(async () => {
    const requestId = ++expenseRequestRef.current;

    try {
      const nextExpenses = await budgetService.getExpenses(filtersRef.current);
      if (requestId !== expenseRequestRef.current) {
        return;
      }
      setExpenses(Array.isArray(nextExpenses) ? nextExpenses : []);
    } catch (err) {
      if (requestId !== expenseRequestRef.current) {
        return;
      }
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
    } finally {
      if (requestId === expenseRequestRef.current) {
        setLoading(false);
      }
    }
  }, [setError, setExpenses, setLoading]);

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await budgetService.getCategories();
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  }, [setCategories, setError]);

  const fetchSummary = useCallback(async () => {
    const requestId = ++summaryRequestRef.current;

    try {
      const summary = await budgetService.getSummary(filtersRef.current);
      if (requestId !== summaryRequestRef.current) {
        return;
      }
      setSummary(summary);
    } catch (err) {
      if (requestId !== summaryRequestRef.current) {
        return;
      }
      console.error('Error fetching expense summary:', err);
    }
  }, [setSummary]);

  return {
    fetchExpenses,
    fetchCategories,
    fetchSummary,
  };
}

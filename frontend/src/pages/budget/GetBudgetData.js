import { budgetService } from '../../api';

export function getBudgetData({
  filters,
  setLoading,
  setError,
  setExpenses,
  setCategories,
  setSummary,
}) {
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expenses = await budgetService.getExpenses(filters);
      setExpenses(expenses);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await budgetService.getCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };

  const fetchSummary = async () => {
    try {
      const summary = await budgetService.getSummary(filters);
      setSummary(summary);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
    }
  };

  return {
    fetchExpenses,
    fetchCategories,
    fetchSummary,
  };
}

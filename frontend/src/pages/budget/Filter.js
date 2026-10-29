import { budgetService } from '../../api';

export function getFilterActions({
  filters,
  setFilters,
  setLoading,
  setError,
  setExpenses,
  setSummary,
}) {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);

      setExpenses(await budgetService.getExpenses(filters));
      setSummary(await budgetService.getSummary(filters));

      setLoading(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters');
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setFilters({
        category: '',
        startDate: '',
        endDate: '',
      });

      setLoading(true);

      setExpenses(await budgetService.getExpenses());
      setSummary(await budgetService.getSummary());

      setLoading(false);
    } catch (err) {
      console.error('Error resetting filters:', err);
      setError('Failed to reset filters');
      setLoading(false);
    }
  };

  return {
    handleFilterChange,
    applyFilters,
    resetFilters,
  };
}

import apiClient from './client';

const toQueryParams = (filters = {}) => {
  const params = {};
  if (filters.category) params.category = filters.category;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  return params;
};

const budgetService = {
  getExpenses: async (filters = {}) => {
    try {
      const response = await apiClient.get('/budget/expenses/', {
        params: toQueryParams(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/budget/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  createCategory: async (category) => {
    try {
      const response = await apiClient.post('/budget/categories/', category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  getSummary: async (filters = {}) => {
    try {
      const response = await apiClient.get('/budget/expenses/summary/', {
        params: toQueryParams(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      throw error;
    }
  },

  createExpense: async (formData) => {
    try {
      const response = await apiClient.post('/budget/expenses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  updateExpense: async (expenseId, formData) => {
    try {
      const response = await apiClient.patch(`/budget/expenses/${expenseId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      const response = await apiClient.delete(`/budget/expenses/${expenseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },
};

export default budgetService;

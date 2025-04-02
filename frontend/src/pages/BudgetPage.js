import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '../api/client';
import { win98Alert, win98Confirm, win98Prompt } from '../utils/modalService';

const BudgetPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    location: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    receipt_image: null
  });
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [keepReceipt, setKeepReceipt] = useState(true);
  
  // File input ref for resetting
  const fileInputRef = React.useRef();
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    // Fetch categories and expenses on component mount
    fetchCategories();
    fetchExpenses();
    fetchSummary();
  }, []);
  
  // Fetch expenses with optional filters
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/budget/expenses/';
      
      // Add query params for filters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      setExpenses(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
      setLoading(false);
    }
  };
  
  // Fetch expense categories
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/budget/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };
  
  // Fetch expense summary
  const fetchSummary = async () => {
    try {
      let url = '/budget/expenses/summary/';
      
      // Add query params for filters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle file input
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      receipt_image: e.target.files[0]
    });
  };
  
  // Handle category creation
  const handleCreateCategory = async () => {
    try {
      const categoryName = await win98Prompt('Enter new category name:', '', 'New Category');
      if (!categoryName) return;
      
      const response = await apiClient.post('/budget/categories/', {
        name: categoryName,
        color: getRandomColor()
      });
      
      setCategories([...categories, response.data]);
      
      // Select the new category
      setFormData({
        ...formData,
        category: response.data.id
      });
    } catch (err) {
      console.error('Error creating category:', err);
      await win98Alert('Failed to create category', 'Error', 'error');
    }
  };
  
  // Generate a random color for new categories
  const getRandomColor = () => {
    const colors = [
      '#6c757d', '#007bff', '#28a745', '#dc3545', '#ffc107',
      '#17a2b8', '#343a40', '#f8f9fa', '#6610f2', '#fd7e14'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Start editing an expense
  const handleEdit = (expense) => {
    setEditingExpenseId(expense.id);
    setEditMode(true);
    setKeepReceipt(true);
    
    setFormData({
      amount: expense.amount,
      description: expense.description,
      location: expense.location,
      category: expense.category || '',
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      receipt_image: null // We don't need to populate this as we'll handle it separately
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingExpenseId(null);
    setKeepReceipt(true);
    
    // Reset form
    setFormData({
      amount: '',
      description: '',
      location: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      receipt_image: null
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle delete expense
  const handleDelete = async (expenseId) => {
    try {
      const confirmed = await win98Confirm(
        'Are you sure you want to delete this expense?', 
        'Confirm Deletion', 
        'warning'
      );
      
      if (!confirmed) {
        return;
      }
      
      await apiClient.delete(`/budget/expenses/${expenseId}/`);
      
      // Refresh data
      fetchExpenses();
      fetchSummary();
      
      await win98Alert('Expense deleted successfully', 'Success', 'info');
    } catch (err) {
      console.error('Error deleting expense:', err);
      await win98Alert('Failed to delete expense', 'Error', 'error');
    }
  };
  
  // Handle toggle receipt keep/remove
  const handleToggleReceipt = () => {
    setKeepReceipt(!keepReceipt);
  };
  
  // Handle form submission (for both create and update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('amount', formData.amount);
      data.append('description', formData.description);
      data.append('location', formData.location);
      if (formData.category) data.append('category', formData.category);
      data.append('date', formData.date);
      
      if (editMode) {
        // If editing and we want to remove the receipt
        if (!keepReceipt) {
          data.append('remove_receipt', 'true');
        }
        
        // If editing and we have a new receipt image
        if (formData.receipt_image) {
          data.append('receipt_image', formData.receipt_image);
        }
        
        // Update existing expense
        await apiClient.patch(`/budget/expenses/${editingExpenseId}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Exit edit mode
        setEditMode(false);
        setEditingExpenseId(null);
        
        // Success message
        await win98Alert('Expense updated successfully', 'Success', 'info');
      } else {
        // Create new expense
        if (formData.receipt_image) {
          data.append('receipt_image', formData.receipt_image);
        }
        
        await apiClient.post('/budget/expenses/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Success message
        await win98Alert('Expense added successfully', 'Success', 'info');
      }
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        location: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        receipt_image: null
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh data
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.error('Error saving expense:', err);
      await win98Alert('Failed to save expense', 'Error', 'error');
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build URL parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      // Fetch expenses with filters
      const expensesUrl = params.toString() ? `/budget/expenses/?${params.toString()}` : '/budget/expenses/';
      const expensesResponse = await apiClient.get(expensesUrl);
      setExpenses(expensesResponse.data);
      
      // Fetch summary with filters
      const summaryUrl = params.toString() ? `/budget/expenses/summary/?${params.toString()}` : '/budget/expenses/summary/';
      const summaryResponse = await apiClient.get(summaryUrl);
      setSummary(summaryResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters');
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = async () => {
    try {
      // Reset filter state
      setFilters({
        category: '',
        startDate: '',
        endDate: ''
      });
      
      setLoading(true);
      
      // Fetch data with no filters
      const expensesResponse = await apiClient.get('/budget/expenses/');
      setExpenses(expensesResponse.data);
      
      const summaryResponse = await apiClient.get('/budget/expenses/summary/');
      setSummary(summaryResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error resetting filters:', err);
      setError('Failed to reset filters');
      setLoading(false);
    }
  };
  
  // Format amount as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  // Group expenses by month
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const monthYear = format(new Date(expense.date), 'MMMM yyyy');
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(expense);
    return acc;
  }, {});
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Budget Manager</h2>
      
      {/* Expense Form */}
      <div className="window-win98 mb-4">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">
            {editMode ? 'Edit Expense' : 'New Expense'}
          </div>
        </div>
        <div className="p-4 bg-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold" htmlFor="amount">
                  Amount ($)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-400 p-2"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-bold" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-400 p-2"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-bold" htmlFor="description">
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-400 p-2"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-bold" htmlFor="location">
                  Where
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-400 p-2"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-bold" htmlFor="category">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 border-2 border-gray-400 p-2"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleCreateCategory}
                    className="btn-win98"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-bold" htmlFor="receipt">
                  Receipt {editMode ? '(leave empty to keep current)' : '(optional)'}
                </label>
                <input
                  id="receipt"
                  name="receipt"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full border-2 border-gray-400 p-2"
                  accept="image/*"
                />
                
                {editMode && editingExpenseId && (
                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={keepReceipt}
                        onChange={handleToggleReceipt}
                        className="mr-2"
                      />
                      Keep existing receipt {!keepReceipt && '(will be removed)'}
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-win98"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn-win98"
              >
                {editMode ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Summary Section */}
      {summary && (
        <div className="window-win98 mb-4">
          <div className="window-title-win98">
            <div className="text-black font-bold px-2">Expense Summary</div>
          </div>
          <div className="p-4 bg-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="text-xl font-bold mb-2 md:mb-0">
                <span>Total Expenses:</span> {formatCurrency(summary.total)}
              </div>
              
              <div className="p-2 border-2 border-gray-400 bg-gray-200 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-2 mb-2 items-start md:items-center">
                  <label className="whitespace-nowrap font-bold min-w-[80px]">Category:</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="border-2 border-gray-400 p-1 bg-white w-full md:w-auto"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 mb-2 items-start md:items-center">
                  <label className="whitespace-nowrap font-bold min-w-[80px]">Date Range:</label>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      placeholder="Start Date"
                      className="border-2 border-gray-400 p-1 bg-white w-full"
                    />
                    <span className="self-center hidden sm:block">to</span>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      placeholder="End Date"
                      className="border-2 border-gray-400 p-1 bg-white w-full"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="btn-win98"
                  >
                    Apply Filter
                  </button>
                  
                  <button
                    onClick={resetFilters}
                    className="btn-win98"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Category Summary */}
            {summary.by_category.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Expenses by Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {summary.by_category.map((category, index) => (
                    <div key={index} className="flex justify-between p-2 border-b">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <span>{formatCurrency(category.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Monthly Summary */}
            {summary.by_month.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Expenses by Month</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {summary.by_month.map((month, index) => (
                    <div key={index} className="flex justify-between p-2 border-b">
                      <span>{month.month}</span>
                      <span>{formatCurrency(month.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Expenses List */}
      <div className="window-win98">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Expenses</div>
        </div>
        <div className="p-4 bg-gray-200">
          {loading ? (
            <div className="text-center py-4">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-4">No expenses found. Add some to get started!</div>
          ) : (
            <div>
              {Object.keys(groupedExpenses).map(monthYear => (
                <div key={monthYear} className="mb-4">
                  <h3 className="font-bold border-b-2 border-gray-400 pb-1 mb-2">{monthYear}</h3>
                  
                  <div className="space-y-2">
                    {groupedExpenses[monthYear].map(expense => (
                      <div key={expense.id} className="p-3 border border-gray-400 bg-white">
                        <div className="flex justify-between">
                          <div className="font-bold">{expense.description}</div>
                          <div className="font-bold">{formatCurrency(expense.amount)}</div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <div>{expense.location}</div>
                          <div>{formatDate(expense.date)}</div>
                        </div>
                        
                        {expense.category && (
                          <div className="mt-1">
                            <span
                              className="inline-block px-2 py-1 text-xs text-white rounded"
                              style={{ backgroundColor: expense.category_color }}
                            >
                              {expense.category_name}
                            </span>
                          </div>
                        )}
                        
                        {expense.receipt_url && (
                          <div className="mt-1">
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 text-sm"
                            >
                              View Receipt
                            </a>
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="btn-win98 btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="btn-win98 btn-sm bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default BudgetPage; 
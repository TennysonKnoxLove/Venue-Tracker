import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { getBudgetData } from './GetBudgetData';
import { useBudgetEffects } from './Effects';
import { getCategoryActions } from './Categories';
import { getFilterActions } from './Filter';
import { getFormActions } from './Form';
import { formatCurrency, formatDate, groupExpensesByMonth } from './Utils';

const BudgetPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    location: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    receipt_image: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [keepReceipt, setKeepReceipt] = useState(true);
  const fileInputRef = useRef();

  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  const { fetchExpenses, fetchCategories, fetchSummary } = getBudgetData({
    filters,
    setLoading,
    setError,
    setExpenses,
    setCategories,
    setSummary,
  });

  useBudgetEffects({ fetchCategories, fetchExpenses, fetchSummary });

  const { handleCreateCategory } = getCategoryActions({
    categories,
    setCategories,
    formData,
    setFormData,
  });

  const {
    handleInputChange,
    handleFileChange,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    handleToggleReceipt,
    handleSubmit,
  } = getFormActions({
    formData,
    setFormData,
    editMode,
    setEditMode,
    editingExpenseId,
    setEditingExpenseId,
    keepReceipt,
    setKeepReceipt,
    fileInputRef,
    fetchExpenses,
    fetchSummary,
  });

  const { handleFilterChange, applyFilters, resetFilters } = getFilterActions({
    filters,
    setFilters,
    setLoading,
    setError,
    setExpenses,
    setSummary,
  });

  const groupedExpenses = groupExpensesByMonth(expenses);
  
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
                  <label className="whitespace-nowrap font-bold min-w-[80px]">Range: </label>
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
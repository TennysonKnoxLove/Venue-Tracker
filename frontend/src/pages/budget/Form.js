import { format } from 'date-fns';
import { budgetService } from '../../api';
import { win98Alert, win98Confirm } from '../../utils/Win98Modals';

const emptyForm = () => ({
  amount: '',
  description: '',
  location: '',
  category: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  receipt_image: null,
});

const fieldLabels = {
  amount: 'Amount',
  description: 'Description',
  location: 'Where',
  category: 'Category',
  date: 'Date',
  receipt_image: 'Receipt',
  non_field_errors: 'Error',
};

const formatSaveError = (err) => {
  const data = err?.response?.data;
  if (!data) {
    return 'Failed to save expense';
  }
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const messages = Object.entries(data).flatMap(([field, fieldErrors]) => {
    const text = Array.isArray(fieldErrors) ? fieldErrors.join(' ') : String(fieldErrors);
    if (!text || text === '[object Object]') {
      return [];
    }
    const label = fieldLabels[field] || field.replace(/_/g, ' ');
    return [`${label}: ${text}`];
  });

  return messages.length > 0 ? messages.join('\n') : 'Failed to save expense';
};

export function getFormActions({
  formData,
  setFormData,
  editMode,
  setEditMode,
  editingExpenseId,
  setEditingExpenseId,
  keepReceipt,
  setKeepReceipt,
  fileInputRef,
  setExpenses,
  fetchExpenses,
  fetchSummary,
  setFormError,
}) {
  const upsertExpense = (saved) => {
    if (!saved || saved.id == null) {
      return;
    }

    setExpenses((current) => {
      const list = Array.isArray(current) ? current : [];
      return [saved, ...list.filter((expense) => expense.id !== saved.id)];
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormError(null);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      receipt_image: e.target.files[0],
    });
  };

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
      receipt_image: null,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingExpenseId(null);
    setKeepReceipt(true);
    setFormError(null);
    setFormData(emptyForm());

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      await budgetService.deleteExpense(expenseId);

      setExpenses((current) =>
        (Array.isArray(current) ? current : []).filter((expense) => expense.id !== expenseId)
      );

      await Promise.all([fetchExpenses(), fetchSummary()]);

      await win98Alert('Expense deleted successfully', 'Success', 'info');
    } catch (err) {
      console.error('Error deleting expense:', err);
      await win98Alert('Failed to delete expense', 'Error', 'error');
    }
  };

  const handleToggleReceipt = () => {
    setKeepReceipt(!keepReceipt);
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      const data = new FormData();
      data.append('amount', formData.amount);
      data.append('description', formData.description);
      data.append('location', formData.location);
      if (formData.category) data.append('category', formData.category);
      data.append('date', formData.date);

      if (formData.receipt_image) {
        data.append('receipt_image', formData.receipt_image);
      }

      const saved = editMode
        ? await budgetService.updateExpense(editingExpenseId, data)
        : await budgetService.createExpense(data);

      upsertExpense(saved);

      if (editMode) {
        setEditMode(false);
        setEditingExpenseId(null);
      }

      setKeepReceipt(true);
      setFormData(emptyForm());

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await Promise.all([fetchExpenses(), fetchSummary()]);

      await win98Alert(
        editMode ? 'Expense updated successfully' : 'Expense added successfully',
        'Success',
        'info'
      );
    } catch (err) {
      console.error('Error saving expense:', err);
      const message = formatSaveError(err);
      setFormError(message);
      await win98Alert(message, 'Error', 'error');
    }
  };

  return {
    handleInputChange,
    handleFileChange,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    handleToggleReceipt,
    handleSubmit,
  };
}

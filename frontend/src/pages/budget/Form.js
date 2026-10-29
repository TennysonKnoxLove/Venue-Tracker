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
  fetchExpenses,
  fetchSummary,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

      fetchExpenses();
      fetchSummary();

      await win98Alert('Expense deleted successfully', 'Success', 'info');
    } catch (err) {
      console.error('Error deleting expense:', err);
      await win98Alert('Failed to delete expense', 'Error', 'error');
    }
  };

  const handleToggleReceipt = () => {
    setKeepReceipt(!keepReceipt);
  }; // Is this used?

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('amount', formData.amount);
      data.append('description', formData.description);
      data.append('location', formData.location);
      if (formData.category) data.append('category', formData.category);
      data.append('date', formData.date);

      if (editMode) {
        if (!keepReceipt) {
          data.append('remove_receipt', 'true');
        }

        if (formData.receipt_image) {
          data.append('receipt_image', formData.receipt_image);
        }

        await budgetService.updateExpense(editingExpenseId, data);

        setEditMode(false);
        setEditingExpenseId(null);

        await win98Alert('Expense updated successfully', 'Success', 'info');
      } else {
        if (formData.receipt_image) {
          data.append('receipt_image', formData.receipt_image);
        }

        await budgetService.createExpense(data);

        await win98Alert('Expense added successfully', 'Success', 'info');
      }

      setFormData(emptyForm());

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.error('Error saving expense:', err);
      await win98Alert('Failed to save expense', 'Error', 'error');
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

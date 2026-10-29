import { format } from 'date-fns';
import { formatCurrency, formatDate } from '../../utils/Format';

export { formatCurrency, formatDate };

export function groupExpensesByMonth(expenses) {
  return expenses.reduce((acc, expense) => {
    const monthYear = format(new Date(expense.date), 'MMMM yyyy');

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }

    acc[monthYear].push(expense);
    return acc;
  }, {});
}

export const getRandomColor = () => {
  const colors = [
    '#6c757d', '#007bff', '#28a745', '#dc3545', '#ffc107',
    '#17a2b8', '#343a40', '#f8f9fa', '#6610f2', '#fd7e14',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
import { format } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy');
}

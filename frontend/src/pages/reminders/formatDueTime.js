import moment from 'moment';

export function formatDueTime(dateTime) {
  const now = moment();
  const due = moment(dateTime);
  const diffDays = due.diff(now, 'days');

  if (diffDays === 0) {
    return `Today at ${due.format('h:mm A')}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${due.format('h:mm A')}`;
  } else if (diffDays > 1 && diffDays < 7) {
    return `${due.format('dddd')} at ${due.format('h:mm A')}`;
  }
  return due.format('MMM D, YYYY [at] h:mm A');
}

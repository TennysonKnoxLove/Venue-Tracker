import { Link } from 'react-router-dom';
import { useRemindersDashboard } from './useRemindersDashboard';
import ReminderList from './ReminderList';
import NotificationMenu from './NotificationMenu';
import SnoozeDialog from './SnoozeDialog';

const RemindersDashboard = () => {
  const {
    loading,
    todayReminders,
    upcomingReminders,
    overdueReminders,
    notifications,
    completingReminder,
    showSnoozeOptions,
    handleMarkReminderComplete,
    handleSnoozeReminder,
    confirmSnooze,
    cancelSnooze,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
  } = useRemindersDashboard();

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading reminders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-900 text-white p-1 font-bold">
          Reminders
          {overdueReminders.length > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-1 rounded">
              {overdueReminders.length} overdue
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <NotificationMenu
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onMarkRead={handleMarkNotificationRead}
          />
          <Link to="/reminders/new" className="btn-win98">
            + New Reminder
          </Link>
        </div>
      </div>

      <ReminderList
        todayReminders={todayReminders}
        upcomingReminders={upcomingReminders}
        overdueReminders={overdueReminders}
        completingReminder={completingReminder}
        onComplete={handleMarkReminderComplete}
        onSnooze={handleSnoozeReminder}
      />

      <SnoozeDialog
        open={showSnoozeOptions}
        onCancel={cancelSnooze}
        onConfirm={confirmSnooze}
      />
    </div>
  );
};

export default RemindersDashboard;

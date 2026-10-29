import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { remindersService } from '../../api';
import modalService from '../../utils/Win98Modals';

export function useRemindersDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [overdueReminders, setOverdueReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [completingReminder, setCompletingReminder] = useState(null);
  const [snoozingReminder, setSnoozingReminder] = useState(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const fetchAllReminders = useCallback(async () => {
    try {
      setLoading(true);
      const [todayData, upcomingData, overdueData] = await Promise.all([
        remindersService.getTodayReminders(),
        remindersService.getUpcomingReminders(),
        remindersService.getOverdueReminders()
      ]);

      setTodayReminders(todayData);
      setUpcomingReminders(upcomingData);
      setOverdueReminders(overdueData);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      alert('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await remindersService.getNotifications(false);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllReminders();
    fetchNotifications();
  }, [fetchAllReminders, fetchNotifications]);

  const handleMarkReminderComplete = async (reminderId) => {
    try {
      setCompletingReminder(reminderId);
      await remindersService.completeReminder(reminderId);
      fetchAllReminders();
      modalService.alert('Reminder marked as completed', 'Success', 'info');
    } catch (error) {
      console.error('Error completing reminder:', error);
      modalService.alert('Failed to complete reminder', 'Error', 'error');
    } finally {
      setCompletingReminder(null);
    }
  };

  const handleSnoozeReminder = (reminderId) => {
    setSnoozingReminder(reminderId);
    setShowSnoozeOptions(true);
  };

  const confirmSnooze = async (snoozeTime) => {
    try {
      if (!snoozingReminder) return;

      const reminder = overdueReminders.find(r => r.id === snoozingReminder);
      if (!reminder) return;

      const newDueDate = moment().add(parseInt(snoozeTime, 10), 'minutes');

      await remindersService.updateReminder(snoozingReminder, {
        ...reminder,
        due_date: newDueDate.format('YYYY-MM-DD'),
        due_time: newDueDate.format('HH:mm')
      });

      setOverdueReminders(overdueReminders.filter(r => r.id !== snoozingReminder));
      setShowSnoozeOptions(false);
      setSnoozingReminder(null);
      fetchAllReminders();

      modalService.alert(`Reminder snoozed for ${snoozeTime} minutes`, 'Reminder Snoozed', 'info');
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      modalService.alert('Failed to snooze reminder', 'Error', 'error');
    }
  };

  const cancelSnooze = () => {
    setShowSnoozeOptions(false);
    setSnoozingReminder(null);
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await remindersService.markAllNotificationsRead();
      setNotifications([]);
      modalService.alert('All notifications marked as read', 'Notifications', 'info');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      modalService.alert('Failed to mark notifications as read', 'Error', 'error');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await remindersService.markNotificationRead(notificationId);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      modalService.alert('Failed to mark notification as read', 'Error', 'error');
    }
  };

  return {
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
  };
}

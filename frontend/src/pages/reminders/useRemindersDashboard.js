import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { remindersService } from '../../api';
import modalService from '../../utils/Win98Modals';

export function useRemindersDashboard() {
  const [loading, setLoading] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [overdueReminders, setOverdueReminders] = useState([]);
  const [completingReminder, setCompletingReminder] = useState(null);
  const [snoozingReminder, setSnoozingReminder] = useState(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const fetchAllReminders = useCallback(async () => {
    try {
      setLoading(true);
      const [upcomingData, overdueData] = await Promise.all([
        remindersService.getUpcomingReminders(),
        remindersService.getOverdueReminders()
      ]);

      setUpcomingReminders(upcomingData);
      setOverdueReminders(overdueData);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      alert('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReminders();
  }, [fetchAllReminders]);

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

  return {
    loading,
    upcomingReminders,
    overdueReminders,
    completingReminder,
    showSnoozeOptions,
    handleMarkReminderComplete,
    handleSnoozeReminder,
    confirmSnooze,
    cancelSnooze,
  };
}

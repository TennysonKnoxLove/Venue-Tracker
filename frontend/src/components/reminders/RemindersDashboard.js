import React, { useState, useEffect } from 'react';
import { remindersService } from '../../api';
import { Link } from 'react-router-dom';
import moment from 'moment';
import modalService from '../../utils/modalService';

const RemindersDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [overdueReminders, setOverdueReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [completingReminder, setCompletingReminder] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNotifications, setShowNotifications] = useState(false);
  const [snoozingReminder, setSnoozingReminder] = useState(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snoozeTime, setSnoozeTime] = useState('15');

  useEffect(() => {
    fetchAllReminders();
    fetchNotifications();
  }, []);

  const fetchAllReminders = async () => {
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
  };

  const fetchNotifications = async () => {
    try {
      const data = await remindersService.getNotifications(false); // false to get unread notifications
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkReminderComplete = async (reminderId) => {
    try {
      setCompletingReminder(reminderId);
      await remindersService.completeReminder(reminderId);
      
      // Refresh all reminders immediately to ensure accurate counts
      fetchAllReminders();
      
      modalService.alert('Reminder marked as completed', 'Success', 'info');
    } catch (error) {
      console.error('Error completing reminder:', error);
      modalService.alert('Failed to complete reminder', 'Error', 'error');
    } finally {
      setCompletingReminder(null);
    }
  };

  const handleSnoozeReminder = async (reminderId) => {
    setSnoozingReminder(reminderId);
    setShowSnoozeOptions(true);
  };

  const confirmSnooze = async () => {
    try {
      if (!snoozingReminder) return;

      // Get the reminder details
      const reminder = overdueReminders.find(r => r.id === snoozingReminder);
      if (!reminder) return;

      // Calculate new due date
      const newDueDate = moment().add(parseInt(snoozeTime), 'minutes');
      
      // Update the reminder with the new due date
      await remindersService.updateReminder(snoozingReminder, {
        ...reminder,
        due_date: newDueDate.format('YYYY-MM-DD'),
        due_time: newDueDate.format('HH:mm')
      });
      
      // Update UI
      setOverdueReminders(overdueReminders.filter(r => r.id !== snoozingReminder));
      
      // Close snooze dialog
      setShowSnoozeOptions(false);
      setSnoozingReminder(null);
      
      // Refresh reminders
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

  const getPriorityDisplay = (priority) => {
    // Handle case where priority is undefined or null
    if (!priority) {
      return <span className="bg-gray-500 text-white text-xs px-1 rounded">None</span>;
    }

    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-green-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    
    return (
      <span className={`${colors[priority]} text-white text-xs px-1 rounded`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatDueTime = (dateTime) => {
    const now = moment();
    const due = moment(dateTime);
    const diffDays = due.diff(now, 'days');
    
    if (diffDays === 0) {
      return `Today at ${due.format('h:mm A')}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${due.format('h:mm A')}`;
    } else if (diffDays > 1 && diffDays < 7) {
      return `${due.format('dddd')} at ${due.format('h:mm A')}`;
    } else {
      return due.format('MMM D, YYYY [at] h:mm A');
    }
  };

  const renderReminderList = (reminders, showOverdueLabel = false) => {
    if (reminders.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="file-icon mx-auto"></div>
          </div>
          <div>No reminders</div>
        </div>
      );
    }
    
    return (
      <div className="list-view">
        {reminders.map(item => (
          <div key={item.id} className="p-3 border-b border-gray-400 hover:bg-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold">{item.title}</span>
                  <span className="ml-2">{getPriorityDisplay(item.priority)}</span>
                  {showOverdueLabel && (
                    <span className="bg-red-600 text-white text-xs px-1 rounded">Overdue</span>
                  )}
                </div>
                
                <div className="text-sm">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">⏰</span>
                    Due: {formatDueTime(item.due_date)}
                  </div>
                  
                  {item.category_name && (
                    <div className="mt-1">
                      <span 
                        className="inline-block px-1 text-xs text-white rounded"
                        style={{ backgroundColor: item.category_color || '#1890ff' }}
                      >
                        {item.category_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {showOverdueLabel && (
                  <button 
                    className="btn-win98 text-xs flex items-center"
                    onClick={() => handleSnoozeReminder(item.id)}
                  >
                    <span className="mr-1">⏰</span> Snooze
                  </button>
                )}
                <button 
                  className="btn-win98 text-xs"
                  onClick={() => handleMarkReminderComplete(item.id)}
                  disabled={completingReminder === item.id}
                >
                  {completingReminder === item.id ? 'Saving...' : '✓ Done'}
                </button>
                <Link to={`/reminders/${item.id}`} className="btn-win98 text-xs">
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNotifications = () => {
    if (notifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="file-icon mx-auto"></div>
          </div>
          <div>No new notifications</div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex justify-end mb-4">
          <button 
            className="btn-win98"
            onClick={handleMarkAllNotificationsRead}
          >
            Mark All as Read
          </button>
        </div>
        
        <div className="list-view">
          {notifications.map(item => (
            <div key={item.id} className="p-3 border-b border-gray-400 hover:bg-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="font-bold mb-1">Reminder: {item.reminder_title}</div>
                  <div className="text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">🔔</span>
                      {new Date(item.sent_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn-win98 text-xs"
                  onClick={() => handleMarkNotificationRead(item.id)}
                >
                  Mark as Read
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          <div className="relative">
            <button 
              className="btn-win98 flex items-center"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔 
              {notifications.length > 0 && (
                <span className="ml-1 bg-red-600 text-white text-xs px-1 rounded">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-1 w-72 bg-gray-300 border-2 border-gray-400 shadow z-10">
                <div className="bg-blue-900 text-white p-1 font-bold">
                  Notifications
                </div>
                <div className="p-2">
                  {renderNotifications()}
                </div>
              </div>
            )}
          </div>
          
          <Link to="/reminders/new" className="btn-win98">
            + New Reminder
          </Link>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-400">
          <button
            className={`tab-win98 mr-1 ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-win98 ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            Overdue {overdueReminders.length > 0 && (
              <span className="inline-block ml-1 px-2 bg-red-600 text-white text-xs border border-red-800 shadow-inner rounded-sm">
                {overdueReminders.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="mt-2 p-2 bg-white border-2 border-gray-400 inset">
          {activeTab === 'upcoming' && renderReminderList(upcomingReminders)}
          {activeTab === 'overdue' && renderReminderList(overdueReminders, true)}
        </div>
      </div>

      {/* Snooze Modal - Windows 98 Style */}
      {showSnoozeOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-gray-400 shadow-md w-80">
            <div className="bg-blue-900 text-white p-1 font-bold flex justify-between items-center">
              <span>Snooze Reminder</span>
              <button onClick={cancelSnooze} className="text-white hover:text-gray-300">✕</button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block mb-2">Remind me again in:</label>
                <select 
                  className="w-full p-1 border-2 border-gray-400 bg-white"
                  value={snoozeTime}
                  onChange={(e) => setSnoozeTime(e.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="360">6 hours</option>
                  <option value="720">12 hours</option>
                  <option value="1440">1 day</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={cancelSnooze} className="btn-win98">
                  Cancel
                </button>
                <button onClick={confirmSnooze} className="btn-win98">
                  Snooze
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersDashboard;
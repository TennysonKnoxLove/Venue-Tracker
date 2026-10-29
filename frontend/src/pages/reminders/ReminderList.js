import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDueTime } from './formatDueTime';

const getPriorityDisplay = (priority) => {
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

const ReminderItems = ({ reminders, showOverdueLabel, completingReminder, onComplete, onSnooze }) => {
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
                  onClick={() => onSnooze(item.id)}
                >
                  <span className="mr-1">⏰</span> Snooze
                </button>
              )}
              <button
                className="btn-win98 text-xs"
                onClick={() => onComplete(item.id)}
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

const ReminderList = ({
  todayReminders,
  upcomingReminders,
  overdueReminders,
  completingReminder,
  onComplete,
  onSnooze,
}) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="mb-4">
      <div className="flex border-b border-gray-400">
        <button
          className={`tab-win98 mr-1 ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today {todayReminders.length > 0 && (
            <span className="inline-block ml-1 px-2 bg-blue-800 text-white text-xs border border-blue-900 shadow-inner rounded-sm">
              {todayReminders.length}
            </span>
          )}
        </button>
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
        {activeTab === 'today' && (
          <ReminderItems
            reminders={todayReminders}
            completingReminder={completingReminder}
            onComplete={onComplete}
            onSnooze={onSnooze}
          />
        )}
        {activeTab === 'upcoming' && (
          <ReminderItems
            reminders={upcomingReminders}
            completingReminder={completingReminder}
            onComplete={onComplete}
            onSnooze={onSnooze}
          />
        )}
        {activeTab === 'overdue' && (
          <ReminderItems
            reminders={overdueReminders}
            showOverdueLabel
            completingReminder={completingReminder}
            onComplete={onComplete}
            onSnooze={onSnooze}
          />
        )}
      </div>
    </div>
  );
};

export default ReminderList;

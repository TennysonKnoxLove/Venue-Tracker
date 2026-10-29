import { useState } from 'react';

const NotificationMenu = ({
  notifications,
  onMarkAllRead,
  onMarkRead,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="btn-win98 flex items-center"
        onClick={() => setOpen(!open)}
      >
        🔔
        {notifications.length > 0 && (
          <span className="ml-1 bg-red-600 text-white text-xs px-1 rounded">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-72 bg-gray-300 border-2 border-gray-400 shadow z-10">
          <div className="bg-blue-900 text-white p-1 font-bold">
            Notifications
          </div>
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="file-icon mx-auto"></div>
                </div>
                <div>No new notifications</div>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    className="btn-win98"
                    onClick={onMarkAllRead}
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
                          onClick={() => onMarkRead(item.id)}
                        >
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;

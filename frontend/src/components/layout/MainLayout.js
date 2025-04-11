import React, { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Window from './Window';
import { AuthContext } from '../../context/AuthContext';
import Button from './Button';
import { remindersService } from '../../api';

const MainLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [overdueCount, setOverdueCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  const fetchOverdueReminders = async () => {
    try {
      const overdueData = await remindersService.getOverdueReminders();
      setOverdueCount(overdueData.length);
    } catch (error) {
      console.error('Error fetching overdue reminders:', error);
    }
  };
  
  useEffect(() => {
    // Fetch overdue reminders to display notification count
    fetchOverdueReminders();
    
    // Set up interval to check for new overdue reminders every minute
    const interval = setInterval(fetchOverdueReminders, 60000);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);
  
  // Refresh overdue count when route changes
  useEffect(() => {
    fetchOverdueReminders();
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#008080' }}>
      <div className="container mx-auto p-4">
        <Window title="Venue Tracker" className="mb-6">
          {/* Button Toolbar */}
          <div className="bg-gray-200 p-2 border-b border-gray-400 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="btn-win98 flex items-center">
                <span className="mr-1">🏠</span> Home
              </Link>
              <Link to="/venues" className="btn-win98 flex items-center">
                <span className="mr-1">🏢</span> Venues
              </Link>
              <Link to="/search" className="btn-win98 flex items-center">
                <span className="mr-1">🔍</span> AI Search
              </Link>
              <Link to="/audio" className="btn-win98 flex items-center">
                <span className="mr-1">🎵</span> Audio
              </Link>
              <Link to="/network" className="btn-win98 flex items-center">
                <span className="mr-1">👥</span> Connections
              </Link>
              <Link to="/email" className="btn-win98 flex items-center">
                <span className="mr-1">📧</span> Email
              </Link>
              <Link to="/chat" className="btn-win98 flex items-center">
                <span className="mr-1">💬</span> Chat
              </Link>
              <Link to="/budget" className="btn-win98 flex items-center">
                <span className="mr-1">💰</span> Budget
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/reminders" className="relative inline-block">
                <span className="text-xl">🔔</span>
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 text-xs bg-red-600 text-white rounded-sm border border-red-800 shadow-inner">
                    {overdueCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="btn-win98 flex items-center">
                <span className="mr-1">👤</span> Profile
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="bg-gray-200 border-t border-gray-400 p-1 text-xs flex justify-between items-center">
            <div>Ready</div>
            <div className="flex items-center">
              <span className="px-2 border-r border-gray-400">Logged in</span>
              <span className="px-2">{currentTime}</span>
            </div>
          </div>
        </Window>
        
        <Window title="Content" className="mb-6">
          <Outlet />
        </Window>
      </div>
    </div>
  );
};

export default MainLayout;
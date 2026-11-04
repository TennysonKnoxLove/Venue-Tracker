import React, { useState, useEffect } from 'react';
import { networkingService } from '../../api';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { win98Alert } from '../../utils/Win98Modals';

const EventsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [upcomingData, pastData] = await Promise.all([
        networkingService.getUpcomingEvents(),
        networkingService.getPastEvents()
      ]);
      
      setUpcomingEvents(upcomingData);
      setPastEvents(pastData);
    } catch (error) {
      console.error('Error fetching networking events:', error);
      win98Alert('Failed to load networking events', 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeDisplay = (eventTypeName) => {
    if (!eventTypeName) return null;

    const colors = {
      conference: 'bg-blue-500',
      workshop: 'bg-green-500',
      meetup: 'bg-purple-500',
      showcase: 'bg-cyan-500',
      competition: 'bg-orange-500',
      festival: 'bg-pink-500',
      seminar: 'bg-yellow-500',
      party: 'bg-pink-300',
      other: 'bg-gray-500',
    };
    const color = colors[eventTypeName.toLowerCase()] || 'bg-blue-500';

    return (
      <span className={`${color} text-white text-xs px-1 rounded`}>
        {eventTypeName}
      </span>
    );
  };

  /**
   * Format event date and time for display
   * @param {string} date - Event date in YYYY-MM-DD format
   * @param {string} time - Event time in HH:MM:SS format
   * @returns {string} Formatted date and time string
   */
  const formatEventDateTime = (date, time) => {
    if (!date) return 'Date not specified';
    
    // Format the date part
    const formattedDate = moment(date).format('MMM D, YYYY');
    
    // Add time if available
    if (time) {
      const formattedTime = moment(time, 'HH:mm:ss').format('h:mm A');
      return `${formattedDate} · ${formattedTime}`;
    }
    
    return formattedDate;
  };

  const renderEventsList = (events) => {
    if (events.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="file-icon mx-auto"></div>
          </div>
          <div>No events found</div>
        </div>
      );
    }
    
    return (
      <div className="list-view">
        {events.map(item => (
          <div key={item.id} className="p-3 border-b border-gray-400 hover:bg-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <Link to={`/networking/events/${item.id}`} className="text-blue-800 underline font-bold">
                  {item.name}
                </Link>
                <span className="ml-2">
                  {getEventTypeDisplay(item.event_type_name)}
                </span>
                {item.virtual && (
                  <span className="bg-blue-600 text-white text-xs px-1 rounded">Virtual</span>
                )}
              </div>
            </div>
            
            <div className="pl-2 my-2">
              <div className="flex items-center mb-1">
                <span className="mr-2">📅</span>
                {formatEventDateTime(item.date, item.time)}
              </div>
              
              {item.location && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">📍</span>
                  {item.location}
                </div>
              )}
              
              {item.cost !== null && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">💰</span>
                  {item.cost > 0 ? `$${item.cost}` : 'Free'}
                </div>
              )}
              
              {item.description && (
                <div className="my-2 text-gray-700 line-clamp-2">
                  {item.description}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-2">
              <Link to={`/networking/events/${item.id}`} className="btn-win98 text-sm">
                View Details
              </Link>
              {item.url && (
                <button 
                  onClick={() => window.open(item.url, '_blank')}
                  className="btn-win98 text-sm"
                >
                  Website
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading networking events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 border-2 border-gray-400 shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-900 text-white p-1 font-bold">
          Industry Events
        </div>
        <Link to="/networking/events/new" className="btn-win98">
          + Add Event
        </Link>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-400">
          <button
            className={`tab-win98 mr-1 ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            className={`tab-win98 ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            📅 Past Events
          </button>
        </div>
        
        <div className="mt-2 p-2 bg-white border-2 border-gray-400 inset">
          {activeTab === 'upcoming' && renderEventsList(upcomingEvents)}
          {activeTab === 'past' && renderEventsList(pastEvents)}
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard; 
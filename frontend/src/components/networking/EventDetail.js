import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { networkingService } from '../../api';
import moment from 'moment';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await networkingService.getEvent(id);
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        alert('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await networkingService.deleteEvent(id);
      alert('Event deleted successfully');
      navigate('/networking');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const formatEventDate = (date, time) => {
    if (!date) return 'No date specified';
    
    const formattedDate = moment(date).format('MMM D, YYYY');
    if (time) {
      return `${formattedDate} at ${moment(time, 'HH:mm:ss').format('h:mm A')}`;
    }
    return formattedDate;
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="window-win98">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Event Not Found</div>
        </div>
        <div className="p-4 bg-gray-200">
          <div className="text-center">
            <p className="mb-4">The event you're looking for could not be found.</p>
            <Link to="/networking" className="btn-win98">
              Back to Networking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="window-win98">
      <div className="window-title-win98 flex items-center justify-between">
        <div className="text-black font-bold px-2">Event Details</div>
      </div>
      <div className="p-4 bg-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{event.name}</h1>
          <div className="flex space-x-2">
            <Link to={`/networking/events/${id}/edit`} className="btn-win98">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-win98">
              Delete
            </button>
          </div>
        </div>
        
        <div className="border-2 border-gray-400 p-4 mb-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-bold mb-2">Basic Information</h2>
              <div className="mb-2">
                <span className="block font-bold">Date & Time:</span>
                <span className="block">{formatEventDate(event.date, event.time)}</span>
              </div>
              
              <div className="mb-2">
                <span className="block font-bold">Location:</span>
                <span className="block">{event.location || 'Not specified'}</span>
              </div>
              
              {event.event_type_name && (
                <div className="mb-2">
                  <span className="block font-bold">Event Type:</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {event.event_type_name}
                  </span>
                </div>
              )}
              
              {event.cost !== null && (
                <div className="mb-2">
                  <span className="block font-bold">Cost:</span>
                  <span className="block">{event.cost > 0 ? `$${event.cost}` : 'Free'}</span>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-bold mb-2">Description</h2>
              <p className="whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
        
        <div className="border-2 border-gray-400 p-4 mb-4 bg-white">
          <h2 className="text-lg font-bold mb-2">Attendees ({event.attendees?.length || 0})</h2>
          
          {event.attendees && event.attendees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {event.attendees.map(attendee => (
                <div key={attendee.id} className="p-2 border border-gray-300 rounded">
                  <div className="font-bold">{attendee.contact_details?.name || 'Unknown Contact'}</div>
                  {attendee.notes && <div className="text-sm">{attendee.notes}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p>No attendees yet.</p>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Link to="/networking" className="btn-win98">
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { networkingService } from '../../api';
import moment from 'moment';

// Fallback event types in case the API call fails
const FALLBACK_EVENT_TYPES = [
  { id: 'conference', name: 'Conference' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'meetup', name: 'Meetup' },
  { id: 'showcase', name: 'Showcase' },
  { id: 'festival', name: 'Festival' },
  { id: 'competition', name: 'Competition' },
  { id: 'seminar', name: 'Seminar' },
  { id: 'party', name: 'Party' },
  { id: 'other', name: 'Other' }
];

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState(FALLBACK_EVENT_TYPES);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    event_type: '',
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm'),
    cost: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event types
        try {
          const typesData = await networkingService.getEventTypes();
          if (Array.isArray(typesData) && typesData.length > 0) {
            setEventTypes(typesData);
          }
        } catch (error) {
          console.warn('Failed to fetch event types, using fallback values', error);
          // We'll use the fallback types already set in state
        }
        
        // If editing, fetch event details
        if (isEditMode) {
          const eventData = await networkingService.getEvent(id);
          setFormData({
            name: eventData.name || '',
            description: eventData.description || '',
            location: eventData.location || '',
            event_type: eventData.event_type || '',
            date: moment(eventData.date).format('YYYY-MM-DD'),
            time: eventData.time ? moment(eventData.time, 'HH:mm:ss').format('HH:mm') : '',
            cost: eventData.cost !== null ? eventData.cost : '',
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        alert('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Prepare event data for submission
      const eventData = {
        ...formData,
        cost: formData.cost !== '' ? parseFloat(formData.cost) : null,
      };
      
      if (isEditMode) {
        await networkingService.updateEvent(id, eventData);
        alert('Event updated successfully');
      } else {
        await networkingService.createEvent(eventData);
        alert('Event created successfully');
      }
      
      navigate('/networking/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="window-win98">
      <div className="window-title-win98">
        <div className="text-black font-bold px-2">
          {isEditMode ? 'Edit Event' : 'New Event'}
        </div>
      </div>
      <div className="p-4 bg-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">
                Event Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Event Type
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
              >
                <option value="">Select Type</option>
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">
                Date*
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Location*
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Leave blank if free"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-gray-400 p-2 h-32"
              placeholder="Event details, what to expect, etc."
            ></textarea>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="btn-win98"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
            </button>
            
            <button
              type="button"
              className="btn-win98"
              onClick={() => navigate('/networking')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 
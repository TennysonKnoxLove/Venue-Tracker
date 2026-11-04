import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { networkingService } from '../../api';
import moment from 'moment';
import { win98Alert } from '../../utils/Win98Modals';

const formatSubmitError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Failed to submit event';
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  const details = Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(', ') : String(messages);
      return `${field}: ${text}`;
    })
    .join('\n');
  return details || 'Failed to submit event';
};

const resolveEventTypeId = async (name, eventTypes) => {
  if (!name) return null;

  const existing = eventTypes.find(
    (type) => type.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing.id;

  try {
    const created = await networkingService.createEventType({ name });
    return created.id;
  } catch (error) {
    const types = await networkingService.getEventTypes();
    const match = (Array.isArray(types) ? types : []).find(
      (type) => type.name.toLowerCase() === name.toLowerCase()
    );
    if (match) return match.id;
    throw error;
  }
};

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true); // Always start with loading to ensure we get event types
  const [submitting, setSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [rawEventTypeInput, setRawEventTypeInput] = useState(''); // New state for text input
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    event_type: '',
    date: moment().format('YYYY-MM-DD'),
    start_time: moment().format('HH:mm'),
    cost: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedEventTypes = [];
        try {
          const typesData = await networkingService.getEventTypes();
          
          if (Array.isArray(typesData)) { // Allow empty array
            setEventTypes(typesData);
            fetchedEventTypes = typesData;
          } else {
            console.warn('Received non-array response for event types');
          }
        } catch (error) {
          console.error('Failed to fetch event types:', error);
          // Don't alert and return, allow form to load, user can type new type
        }
        
        if (isEditMode) {
          const eventData = await networkingService.getEvent(id);
          
          const currentEventTypeId = eventData.event_type
            ? (eventData.event_type.id || eventData.event_type)
            : '';
          const matchedType = fetchedEventTypes.find(
            (et) => String(et.id) === String(currentEventTypeId)
          );

          setFormData({
            name: eventData.name || '',
            description: eventData.description || '',
            location: eventData.location || '',
            event_type: currentEventTypeId,
            date: eventData.date || moment().format('YYYY-MM-DD'),
            start_time: eventData.time ? moment(eventData.time, 'HH:mm:ss').format('HH:mm') : moment().format('HH:mm'),
            cost: eventData.cost !== null ? eventData.cost : ''
          });
          setRawEventTypeInput(eventData.event_type_name || matchedType?.name || '');
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        win98Alert('Failed to load form data', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rawEventTypeInput') {
      setRawEventTypeInput(value);
      // Clear the event_type ID in formData if user types, 
      // it will be resolved on submit or if they select from a datalist later
      setFormData(prevData => ({
        ...prevData,
        event_type: '' 
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create a copy of formData to avoid mutating state directly
      const eventData = { ...formData };
      
      // Format the date and time for API submission
      if (eventData.date) {
        // Ensure date is in YYYY-MM-DD format for the backend
        eventData.date = moment(eventData.date).format('YYYY-MM-DD');
      }
      
      // Use start_time as the time field for the backend
      if (eventData.start_time) {
        // Ensure time is in HH:MM:SS format for the backend
        eventData.time = moment(eventData.start_time, 'HH:mm').format('HH:mm:ss');
      }
      
      // Remove start_time as it's not in the database model
      delete eventData.start_time;

      eventData.event_type = await resolveEventTypeId(rawEventTypeInput.trim(), eventTypes);
      eventData.cost = eventData.cost === '' ? null : eventData.cost;
      
      if (isEditMode) {
        await networkingService.updateEvent(id, eventData);
      } else {
        await networkingService.createEvent(eventData);
      }
      
      await win98Alert(
        `Event ${isEditMode ? 'updated' : 'created'} successfully!`,
        isEditMode ? 'Event Updated' : 'Event Created',
        'info'
      );
      navigate('/networking');
    } catch (err) {
      console.error('Error submitting event:', err);
      const message = formatSubmitError(err);
      setError({ detail: message });
      win98Alert(message, 'Error', 'error');
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
              <label className="block mb-1" htmlFor="rawEventTypeInput">
                Event Type*
              </label>
              <input
                type="text"
                id="rawEventTypeInput" 
                name="rawEventTypeInput"
                value={rawEventTypeInput}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Type or select event type"
                maxLength={50}
                list="event-types-datalist"
              />
              {eventTypes.length > 0 && (
                <datalist id="event-types-datalist">
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.name} />
                  ))}
                </datalist>
              )}
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
                Time*
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
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
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border-2 border-gray-400 p-2"
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
              rows={4}
              className="w-full border-2 border-gray-400 p-2"
            ></textarea>
          </div>
          
          {error && (
            <div className="bg-red-100 border-2 border-red-400 p-3 text-red-700">
              {error.detail || "An error occurred while submitting the form."}
            </div>
          )}
          
          <div className="flex space-x-2 justify-end">
            <button
              type="button"
              onClick={() => navigate('/networking')}
              className="btn-win98"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-win98 bg-blue-800 text-white"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 
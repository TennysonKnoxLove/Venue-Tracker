import { useState } from 'react';
import Button from '../../components/layout/Button';

const VenueForm = ({ onSubmit, onCancel, stateId, initialData = null }) => {
  const [venueName, setVenueName] = useState(initialData ? initialData.name : '');
  const [venueCity, setVenueCity] = useState(initialData ? initialData.city : '');
  const [venueCapacity, setVenueCapacity] = useState(initialData ? initialData.capacity : '');
  const [venueAddress, setVenueAddress] = useState(initialData ? initialData.address : '');
  const [venueZipcode, setVenueZipcode] = useState(initialData ? initialData.zipcode : '');
  const [venuePhone, setVenuePhone] = useState(initialData ? initialData.phone : '');
  const [venueEmail, setVenueEmail] = useState(initialData ? initialData.email : '');
  const [venueWebsite, setVenueWebsite] = useState(initialData ? initialData.website?.replace(/^https?:\/\//, '') : '');
  const [venueDescription, setVenueDescription] = useState(initialData ? initialData.description : '');
  const [venueOpenTime, setVenueOpenTime] = useState(initialData ? initialData.open_time : '');
  const [venueCloseTime, setVenueCloseTime] = useState(initialData ? initialData.close_time : '');
  const [venueNotes, setVenueNotes] = useState(initialData ? initialData.notes : '');
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState('');

  const isEditMode = !!initialData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!venueName) {
      setError('Venue name is required');
      return;
    }
    if (!venueCity) {
      setError('City is required');
      return;
    }

    let formattedWebsite = venueWebsite.trim();
    if (formattedWebsite) {
      if (!formattedWebsite.match(/^https?:\/\//)) {
        formattedWebsite = `https://${formattedWebsite}`;
      }
    } else {
      formattedWebsite = '';
    }

    onSubmit({
      name: venueName,
      city: venueCity,
      capacity: venueCapacity ? parseInt(venueCapacity, 10) : null,
      state_id: stateId,
      address: venueAddress,
      zipcode: venueZipcode,
      phone: venuePhone,
      email: venueEmail,
      website: formattedWebsite,
      description: venueDescription,
      open_time: venueOpenTime || null,
      close_time: venueCloseTime || null,
      notes: venueNotes,
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow-lg max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit Venue' : 'Add New Venue'}</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Basic Info
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'additional' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('additional')}
            type="button"
          >
            Additional Info
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-name">
                Venue Name *
              </label>
              <input
                id="venue-name"
                type="text"
                className="w-full p-2 border rounded"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-description">
                Description
              </label>
              <textarea
                id="venue-description"
                className="w-full p-2 border rounded"
                value={venueDescription}
                onChange={(e) => setVenueDescription(e.target.value)}
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-city">
                City *
              </label>
              <input
                id="venue-city"
                type="text"
                className="w-full p-2 border rounded"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-address">
                Address
              </label>
              <input
                id="venue-address"
                type="text"
                className="w-full p-2 border rounded"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-zipcode">
                Zipcode
              </label>
              <input
                id="venue-zipcode"
                type="text"
                className="w-full p-2 border rounded"
                value={venueZipcode}
                onChange={(e) => setVenueZipcode(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-capacity">
                Capacity
              </label>
              <input
                id="venue-capacity"
                type="number"
                className="w-full p-2 border rounded"
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-phone">
                Phone Number
              </label>
              <input
                id="venue-phone"
                type="tel"
                className="w-full p-2 border rounded"
                value={venuePhone}
                onChange={(e) => setVenuePhone(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-email">
                Email
              </label>
              <input
                id="venue-email"
                type="email"
                className="w-full p-2 border rounded"
                value={venueEmail}
                onChange={(e) => setVenueEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-website">
                Website
              </label>
              <input
                id="venue-website"
                type="text"
                className="w-full p-2 border rounded"
                value={venueWebsite}
                onChange={(e) => setVenueWebsite(e.target.value)}
                placeholder="example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                https:// will be added automatically if not included
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="venue-open-time">
                  Opening Time
                </label>
                <input
                  id="venue-open-time"
                  type="time"
                  className="w-full p-2 border rounded"
                  value={venueOpenTime}
                  onChange={(e) => setVenueOpenTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="venue-close-time">
                  Closing Time
                </label>
                <input
                  id="venue-close-time"
                  type="time"
                  className="w-full p-2 border rounded"
                  value={venueCloseTime}
                  onChange={(e) => setVenueCloseTime(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="venue-notes">
                Additional Notes
              </label>
              <textarea
                id="venue-notes"
                className="w-full p-2 border rounded"
                value={venueNotes}
                onChange={(e) => setVenueNotes(e.target.value)}
                rows="3"
                placeholder="Booking contacts, venue amenities, stage info, etc."
              />
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{isEditMode ? 'Update Venue' : 'Save Venue'}</Button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;

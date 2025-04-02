import React, { useState } from 'react';
import { Venue, State } from '../../types';
import { createVenue } from '../../api/venues';

interface AddVenueFormProps {
  stateId: number;
  onSuccess: (venue: Venue) => void;
  onCancel: () => void;
}

const AddVenueForm: React.FC<AddVenueFormProps> = ({ stateId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Venue>>({
    name: '',
    description: '',
    address: '',
    city: '',
    state_id: stateId,
    zipcode: '',
    phone: '',
    email: '',
    website: '',
    capacity: undefined,
    open_time: '',
    close_time: '',
    notes: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const venue = await createVenue(formData);
      onSuccess(venue);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create venue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="window w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 max-h-screen overflow-y-auto">
        <div className="window-title flex justify-between items-center">
          <div className="px-2">Add New Venue</div>
          <button 
            onClick={onCancel}
            className="px-2 text-white hover:bg-red-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="name">
                Venue Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-win98 w-full"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="description">
                Description:
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-win98 w-full h-24"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="address">
                  Address:
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="city">
                  City:
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="zipcode">
                  Zip Code:
                </label>
                <input
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="phone">
                  Phone:
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="email">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="website">
                  Website:
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="capacity">
                  Capacity:
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity === undefined ? '' : formData.capacity}
                  onChange={handleChange}
                  className="input-win98 w-full"
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="open_time">
                  Opening Time:
                </label>
                <input
                  type="time"
                  id="open_time"
                  name="open_time"
                  value={formData.open_time}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1" htmlFor="close_time">
                  Closing Time:
                </label>
                <input
                  type="time"
                  id="close_time"
                  name="close_time"
                  value={formData.close_time}
                  onChange={handleChange}
                  className="input-win98 w-full"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="notes">
                Notes:
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-win98 w-full h-24"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-win98"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-win98"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Venue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVenueForm; 
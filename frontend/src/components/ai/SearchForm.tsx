import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (state: string, city: string, radius: number) => Promise<void>;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [errors, setErrors] = useState<{
    state?: string;
    city?: string;
    radius?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {
      state?: string;
      city?: string;
      radius?: string;
    } = {};
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!radius || radius <= 0) {
      newErrors.radius = 'Radius must be a positive number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit search
    setErrors({});
    await onSearch(state, city, radius);
  };

  return (
    <div className="window mb-4">
      <div className="window-title">
        <div className="px-2">Venue Discovery</div>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="state">
                State:
              </label>
              <input
                type="text"
                id="state"
                className="input-win98 w-full"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. California"
                required
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm mb-1" htmlFor="city">
                City:
              </label>
              <input
                type="text"
                id="city"
                className="input-win98 w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. Los Angeles"
                required
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm mb-1" htmlFor="radius">
                Radius (miles):
              </label>
              <input
                type="number"
                id="radius"
                className="input-win98 w-full"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                min="1"
                max="100"
                required
              />
              {errors.radius && (
                <p className="text-red-500 text-xs mt-1">{errors.radius}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="btn-win98"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 border-t-2 border-primary rounded-full animate-spin"></span>
                  Searching...
                </span>
              ) : 'Discover Venues'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm; 
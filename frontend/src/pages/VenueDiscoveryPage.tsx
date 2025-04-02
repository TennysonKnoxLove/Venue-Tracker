import React from 'react';
import { Link } from 'react-router-dom';

const VenueDiscoveryPage: React.FC = () => {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Venue Discovery</h1>
        <Link to="/" className="btn-win98">Back to Home</Link>
      </div>
      
      <div className="window mb-4">
        <div className="window-title">
          <div className="px-2">Venue Discovery (Placeholder)</div>
        </div>
        <div className="p-4">
          <form className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="state">
                  State:
                </label>
                <input
                  type="text"
                  id="state"
                  className="input-win98 w-full"
                  placeholder="e.g. California"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1" htmlFor="city">
                  City:
                </label>
                <input
                  type="text"
                  id="city"
                  className="input-win98 w-full"
                  placeholder="e.g. Los Angeles"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1" htmlFor="radius">
                  Radius (miles):
                </label>
                <input
                  type="number"
                  id="radius"
                  className="input-win98 w-full"
                  defaultValue={10}
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn-win98">
                Discover Venues
              </button>
            </div>
          </form>
          
          <div className="text-center py-8">
            <p>Enter location details and click "Discover Venues" to find hip-hop and R&B venues.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDiscoveryPage; 
import React from 'react';
import { Link } from 'react-router-dom';

const VenuesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Venues</h1>
        <Link to="/" className="btn-win98">Back to Home</Link>
      </div>
      
      <div className="window">
        <div className="window-title">
          <div className="px-2">Venue List (Placeholder)</div>
        </div>
        <div className="p-4">
          <p className="text-center py-8">
            This is a placeholder for the venues page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VenuesPage; 
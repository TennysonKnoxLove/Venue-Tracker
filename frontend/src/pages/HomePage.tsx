import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Venue Tracker</h1>
      
      <div className="window">
        <div className="window-title">
          <div className="px-2">Quick Actions</div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/search" className="btn-win98 w-full text-center">
              Discover Venues with AI
            </Link>
            <Link to="/" className="btn-win98 w-full text-center">
              Manage Venues
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm">
          Use our AI-powered venue discovery to find hip-hop and R&B performance venues.
        </p>
      </div>
    </div>
  );
};

export default HomePage; 
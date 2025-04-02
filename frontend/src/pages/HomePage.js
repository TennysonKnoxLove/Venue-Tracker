import React from 'react';
import { Link } from 'react-router-dom';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';

const HomePage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to Venue Tracker</h2>
      <p className="mb-4">This application helps you discover and track music venues for hip-hop and R&B performances.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Window title="Quick Links">
          <Link to="/search" className="block mb-2">
            <Button fullWidth>Discover Venues with AI</Button>
          </Link>
          <Link to="/venues" className="block">
            <Button fullWidth>Manage Venues</Button>
          </Link>
        </Window>
        
        <Window title="Getting Started">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Use AI Discovery to find venues</li>
            <li>Add venues to your collection</li>
            <li>Track contact history with venues</li>
            <li>Manage your audio files</li>
          </ol>
        </Window>
      </div>
    </div>
  );
};

export default HomePage; 
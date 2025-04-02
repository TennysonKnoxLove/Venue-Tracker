import React from 'react';
import { AIVenueResult } from '../../types';

interface VenueSearchResultProps {
  venue: AIVenueResult;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  index: number;
}

const VenueSearchResult: React.FC<VenueSearchResultProps> = ({ 
  venue, 
  onSelect, 
  isSelected,
  index
}) => {
  return (
    <div className={`window mb-4 ${isSelected ? 'border-primary border-4' : ''}`}>
      <div className="window-title flex justify-between items-center">
        <div className="px-2">{venue.name}</div>
        <div className="px-2">
          <input
            type="checkbox"
            id={`venue-${index}`}
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mr-1"
          />
          <label htmlFor={`venue-${index}`} className="text-sm">Select</label>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Contact Information</h3>
            <p>
              <span className="font-medium">Phone:</span> {venue.phone || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Email:</span> {venue.email || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Website:</span>{' '}
              {venue.website ? (
                <a 
                  href={venue.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {venue.website}
                </a>
              ) : 'N/A'}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Location</h3>
            <p>
              <span className="font-medium">Address:</span> {venue.address || 'N/A'}
            </p>
            <p>
              <span className="font-medium">City:</span> {venue.city || 'N/A'}
            </p>
            <p>
              <span className="font-medium">State:</span> {venue.state || 'N/A'}
            </p>
            <p>
              <span className="font-medium">ZIP:</span> {venue.zipcode || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Venue Details</h3>
          <p>
            <span className="font-medium">Capacity:</span> {venue.capacity || 'Unknown'}
          </p>
          <p>
            <span className="font-medium">Genres:</span> {venue.genres || 'N/A'}
          </p>
        </div>
        
        {venue.description && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Description</h3>
            <p className="text-sm">{venue.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueSearchResult; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '../../types';

interface VenueListItemProps {
  venue: Venue;
  onSelect?: (venue: Venue) => void;
}

const VenueListItem: React.FC<VenueListItemProps> = ({ venue, onSelect }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(venue);
    } else {
      navigate(`/venues/${venue.id}`);
    }
  };
  
  return (
    <div 
      className="list-item cursor-pointer"
      onClick={handleClick}
      onDoubleClick={() => navigate(`/venues/${venue.id}`)}
    >
      <div className="w-10 flex items-center justify-center">
        <span className="text-xl">🎵</span>
      </div>
      <div className="flex-grow px-2">
        <div className="font-medium">{venue.name}</div>
        <div className="text-xs text-gray-600 truncate max-w-xs">
          {venue.address ? `${venue.address}, ${venue.city}` : 'No address'}
        </div>
      </div>
      <div className="w-32 text-right text-xs text-gray-600">
        {formatDate(venue.updated_at)}
      </div>
    </div>
  );
};

export default VenueListItem; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { State } from '../../types';

interface FolderItemProps {
  state: State;
  onClick?: (state: State) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ state, onClick }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(state);
    } else {
      navigate(`/states/${state.id}/venues`);
    }
  };
  
  return (
    <div 
      className="folder cursor-pointer" 
      onClick={handleClick}
      onDoubleClick={() => navigate(`/states/${state.id}/venues`)}
    >
      <div className="folder-icon flex items-center justify-center bg-primary text-white border-2 border-border shadow-win98">
        <span className="text-2xl">📁</span>
      </div>
      <div className="folder-name text-center">
        {state.name} ({state.abbreviation})
      </div>
      <div className="text-xs text-gray-600">
        Last modified: {formatDate(state.updated_at)}
      </div>
    </div>
  );
};

export default FolderItem; 
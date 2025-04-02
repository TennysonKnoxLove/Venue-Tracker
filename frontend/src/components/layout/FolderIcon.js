import React from 'react';
import { Link } from 'react-router-dom';

const FolderIcon = ({ name, to, selected, onClick, onNameClick }) => {
  const handleNameClick = (e) => {
    e.stopPropagation(); // Prevent triggering the onClick of the parent
    if (onNameClick) {
      onNameClick(e);
    }
  };
  
  return (
    <div 
      className={`text-center p-2 m-2 cursor-pointer ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className="folder-icon mb-1 h-20 w-24 flex items-center justify-center">
          {/* You can add an icon inside the folder if needed */}
        </div>
        <span 
          className="text-sm hover:text-red-500 transition-colors duration-150" 
          onClick={handleNameClick}
        >
          {name}
        </span>
      </div>
      {to && <Link to={to} className="absolute inset-0 z-10" aria-label={`Open ${name}`} />}
    </div>
  );
};

export default FolderIcon; 
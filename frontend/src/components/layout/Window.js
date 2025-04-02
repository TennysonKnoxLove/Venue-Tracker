import React from 'react';

const Window = ({ title, children, className = '', showMinimize = false, showMaximize = false, showClose = false }) => {
  return (
    <div className={`window ${className}`}>
      <div className="window-title">
        <div className="px-2">{title}</div>
        {(showMinimize || showMaximize || showClose) && (
          <div className="window-title-buttons">
            {showMinimize && (
              <button className="window-button" title="Minimize">
                _
              </button>
            )}
            {showMaximize && (
              <button className="window-button" title="Maximize">
                □
              </button>
            )}
            {showClose && (
              <button className="window-button" title="Close">
                ×
              </button>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Window; 
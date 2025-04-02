import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Win98Modal.css';

const Win98Modal = ({
  isOpen,
  type = 'alert',
  title = 'Windows 98',
  message,
  icon = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onClose,
  onConfirm,
  inputLabel = '',
  inputValue = '',
  onInputChange,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && type === 'prompt' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (onConfirm) onConfirm();
  };

  const handleClose = (e) => {
    e.preventDefault();
    if (onClose) onClose();
  };

  const getIconClass = () => {
    switch (icon) {
      case 'info': return 'icon-info';
      case 'warning': return 'icon-warning';
      case 'error': return 'icon-error';
      case 'question': return 'icon-question';
      default: return 'icon-info';
    }
  };

  return (
    <div className="win98-modal-overlay">
      <div className="win98-modal">
        <div className="win98-modal-titlebar">
          <div className="win98-modal-title">{title}</div>
          <button className="win98-modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="win98-modal-content">
          <div className="win98-modal-body">
            <div className={`win98-modal-icon ${getIconClass()}`}></div>
            <div className="win98-modal-message">{message}</div>
          </div>
          
          {type === 'prompt' && (
            <div className="win98-modal-input-container">
              {inputLabel && <label className="win98-modal-input-label">{inputLabel}</label>}
              <input
                type="text"
                className="win98-modal-input"
                value={inputValue}
                onChange={onInputChange}
                ref={inputRef}
                autoFocus
              />
            </div>
          )}
          
          <div className="win98-modal-buttons">
            {type === 'alert' && (
              <button className="win98-button" onClick={handleClose}>
                {confirmText}
              </button>
            )}
            
            {type === 'confirm' && (
              <>
                <button className="win98-button" onClick={handleConfirm}>
                  {confirmText}
                </button>
                <button className="win98-button" onClick={handleClose}>
                  {cancelText}
                </button>
              </>
            )}
            
            {type === 'prompt' && (
              <>
                <button className="win98-button" onClick={handleConfirm}>
                  {confirmText}
                </button>
                <button className="win98-button" onClick={handleClose}>
                  {cancelText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Win98Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['alert', 'confirm', 'prompt']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(['info', 'warning', 'error', 'question']),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  inputLabel: PropTypes.string,
  inputValue: PropTypes.string,
  onInputChange: PropTypes.func,
};

export default Win98Modal; 
import React from 'react';
import ReactDOM from 'react-dom';
import Win98Modal from '../components/layout/Win98Modal';

// Root element for modal rendering
let modalRoot = null;

// Initialize modal container
const initializeModalContainer = () => {
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'win98-modal-container';
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
};

/**
 * Display a Windows 98 style alert dialog
 * @param {string} message - The message to display
 * @param {string} title - The title of the modal
 * @param {string} icon - Icon type: 'info', 'warning', 'error'
 * @returns {Promise} - Resolves when the user closes the dialog
 */
export const win98Alert = (message, title = 'Windows 98', icon = 'info') => {
  return new Promise((resolve) => {
    const container = initializeModalContainer();
    
    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(container);
      resolve();
    };
    
    ReactDOM.render(
      <Win98Modal
        isOpen={true}
        type="alert"
        message={message}
        title={title}
        icon={icon}
        onClose={handleClose}
        confirmText="OK"
      />,
      container
    );
  });
};

/**
 * Display a Windows 98 style confirmation dialog
 * @param {string} message - The message to display
 * @param {string} title - The title of the modal
 * @param {string} icon - Icon type: 'question', 'warning', 'info', 'error'
 * @returns {Promise<boolean>} - Resolves with true (confirm) or false (cancel)
 */
export const win98Confirm = (message, title = 'Windows 98', icon = 'question') => {
  return new Promise((resolve) => {
    const container = initializeModalContainer();
    
    const handleConfirm = () => {
      ReactDOM.unmountComponentAtNode(container);
      resolve(true);
    };
    
    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(container);
      resolve(false);
    };
    
    ReactDOM.render(
      <Win98Modal
        isOpen={true}
        type="confirm"
        message={message}
        title={title}
        icon={icon}
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmText="Yes"
        cancelText="No"
      />,
      container
    );
  });
};

/**
 * Display a Windows 98 style prompt dialog
 * @param {string} message - The message to display
 * @param {string} defaultValue - Default value for the input
 * @param {string} title - The title of the modal
 * @param {string} inputLabel - Label for the input field
 * @returns {Promise<string|null>} - Resolves with input value or null if canceled
 */
export const win98Prompt = (message, defaultValue = '', title = 'Windows 98', inputLabel = '') => {
  return new Promise((resolve) => {
    const container = initializeModalContainer();
    let inputValue = defaultValue;
    
    const handleInputChange = (e) => {
      inputValue = e.target.value;
      // Re-render the component with the updated input value
      renderPrompt(inputValue);
    };
    
    const handleConfirm = () => {
      ReactDOM.unmountComponentAtNode(container);
      resolve(inputValue);
    };
    
    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(container);
      resolve(null);
    };
    
    // Function to render the prompt with current input value
    const renderPrompt = (currentValue) => {
      ReactDOM.render(
        <Win98Modal
          isOpen={true}
          type="prompt"
          message={message}
          title={title}
          icon="question"
          inputLabel={inputLabel}
          inputValue={currentValue}
          onInputChange={handleInputChange}
          onClose={handleClose}
          onConfirm={handleConfirm}
          confirmText="OK"
          cancelText="Cancel"
        />,
        container
      );
    };
    
    // Initial render
    renderPrompt(inputValue);
  });
};

// Export default object
const modalService = {
  alert: win98Alert,
  confirm: win98Confirm,
  prompt: win98Prompt
};

export default modalService; 
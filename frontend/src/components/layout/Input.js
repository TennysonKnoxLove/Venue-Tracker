import React from 'react';

const Input = ({ 
  type = 'text', 
  id, 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  label = '', 
  required = false,
  min,
  max,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm mb-1">
          {label}{required && <span className="text-red-600">*</span>}:
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="input-win98 w-full"
      />
    </div>
  );
};

export default Input; 
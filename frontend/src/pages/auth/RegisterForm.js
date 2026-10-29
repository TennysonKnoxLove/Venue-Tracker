import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import Window from '../layout/Window';
import Button from '../layout/Button';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Register the user
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });
      
      // Redirect to login page on success
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-600">
      <div className="window w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Register for Venue Tracker</div>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="username">
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-win98 w-full"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-win98 w-full"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="password">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-win98 w-full"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm mb-1" htmlFor="confirmPassword">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-win98 w-full"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button type="submit" className="btn-win98">
                Register
              </button>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => navigate('/login')}
              >
                Already have an account? Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 
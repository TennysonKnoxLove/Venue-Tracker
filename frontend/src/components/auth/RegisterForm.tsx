import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Mock registration - would use real API in production
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-600">
      <div className="window w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Register New Account</div>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 
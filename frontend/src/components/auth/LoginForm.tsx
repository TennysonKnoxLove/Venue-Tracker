import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-600">
      <div className="window w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Login to Venue Tracker</div>
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
            
            <div className="mb-6">
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
            
            <div className="flex items-center justify-between">
              <button type="submit" className="btn-win98">
                Login
              </button>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => navigate('/register')}
              >
                Register New Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 
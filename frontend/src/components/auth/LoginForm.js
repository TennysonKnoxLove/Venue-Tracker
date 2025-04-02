import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Window from '../layout/Window';
import Button from '../layout/Button';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
      <Window className="w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Login to Venue Tracker</div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your username"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your password"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full py-2 px-4">
                Login
              </Button>
              
              <div className="flex justify-between text-sm">
                <Link to="/register" className="text-cyan-600 hover:underline">
                  Create an account
                </Link>
                <Link to="/password-reset" className="text-cyan-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Window>
    </div>
  );
};

export default LoginForm; 
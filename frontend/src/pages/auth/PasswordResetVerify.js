import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import Window from '../layout/Window';
import Button from '../layout/Button';

const PasswordResetVerify = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await authService.verifyPasswordReset(email, verificationCode, newPassword);
      setMessage(response.message || 'Password reset successful');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-600">
      <Window className="w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Set New Password</div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="verificationCode">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter the 6-digit code"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter new password"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirm new password"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {message && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                {message}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Link to="/password-reset" className="text-sm text-cyan-600 hover:underline">
                Back to Reset Request
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="py-2 px-4"
              >
                {isSubmitting ? 'Processing...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </div>
      </Window>
    </div>
  );
};

export default PasswordResetVerify; 
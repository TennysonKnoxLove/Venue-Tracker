import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../api/authService';
import Window from '../layout/Window';
import Button from '../layout/Button';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    setVerificationCode('');

    try {
      const response = await authService.requestPasswordReset(email);
      setMessage(response.message || 'Password reset email sent. Please check your inbox.');
      
      // If in development mode, we'll get the verification code directly
      if (response.verification_code) {
        setVerificationCode(response.verification_code);
      }
      
      setIsRequestSent(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send password reset request. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-600">
      <Window className="w-full max-w-md">
        <div className="window-title">
          <div className="px-2">Reset Password</div>
        </div>
        <div className="p-6">
          {!isRequestSent ? (
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
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Link to="/login" className="text-sm text-cyan-600 hover:underline">
                  Back to login
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="py-2 px-4"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {message}
              </div>
              
              {verificationCode && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                  <p><strong>Development Mode:</strong></p>
                  <p>Your verification code is: <span className="font-mono font-bold">{verificationCode}</span></p>
                  <p className="text-xs mt-1">This code is only displayed in development mode</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Link to="/login" className="text-sm text-cyan-600 hover:underline">
                  Back to login
                </Link>
                <Link to="/password-reset/verify" className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded">
                  Enter Code
                </Link>
              </div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
};

export default PasswordResetRequest; 
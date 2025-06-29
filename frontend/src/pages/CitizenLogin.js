import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showLoginSuccessToast, showErrorToast } from '../utils/toastManager';
import { playClickSound } from '../utils/soundManager';

const CitizenLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If user was redirected, go back there after login
  const from = location.state?.from?.pathname || '/citizen-dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    playClickSound();

    if (!formData.email || !formData.password) {
      showErrorToast('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, 'citizen');
      
      if (result.success) {
        showLoginSuccessToast('citizen');
        navigate(from, { replace: true });
      } else {
        showErrorToast(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-page-enter">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-hero-enter">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">JusticeChain</h2>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">🏛️ Citizen Login</h1>
          <p className="mt-2 text-sm text-gray-600">Access your account to file and track FIRs</p>
          {from !== '/citizen-dashboard' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-scale-in">
              <p className="text-sm text-blue-700">🔐 Please login to file an FIR</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600 animate-slide-in-left">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome back</h3>
            <p className="text-sm text-gray-600">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 animate-scale-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg form-field focus-indicator"
                placeholder="Enter Your Email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg form-field focus-indicator"
                placeholder="Enter Your Password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white btn-animate focus-indicator ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={playClickSound}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>🔒 Secure Login</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  playClickSound();
                  navigate('/citizen-signup');
                }} 
                className="text-blue-600 hover:text-blue-500 font-medium btn-animate"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => {
                playClickSound();
                navigate('/');
              }} 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center btn-animate focus-indicator"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 animate-fade-in">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>📧 Email: admin@justice.gov.in</p>
            <p>🔑 Password: 1234567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
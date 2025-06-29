import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showLoginSuccessToast, showErrorToast } from '../utils/toastManager';
import { playClickSound } from '../utils/soundManager';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const result = await login(formData.email, formData.password, 'admin');
      
      if (result.success) {
        showLoginSuccessToast('admin');
        navigate('/admin-dashboard', { replace: true });
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">JusticeChain</h2>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">👨‍💼 Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Access your account to file and track FIRs</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600 animate-slide-in-left">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrative Access</h3>
            <p className="text-sm text-gray-600">Enter your credentials to access admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-scale-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Official Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg form-field focus-indicator"
                placeholder="Enter Your Official Email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
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
                  navigate('/admin-signup');
                }}
                className="text-green-600 hover:text-green-500 font-medium btn-animate"
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

        <div className="bg-green-50 rounded-lg p-4 border border-green-200 animate-fade-in">
          <h4 className="text-sm font-medium text-green-900 mb-2">Demo Credentials</h4>
          <div className="text-xs text-green-700 space-y-1">
            <p>📧 Email: admin@justice.gov.in</p>
            <p>🔑 Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
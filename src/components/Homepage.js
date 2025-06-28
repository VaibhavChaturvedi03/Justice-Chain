import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showAdminToast } from '../utils/toastManager';
import { playClickSound } from '../utils/soundManager';

const Homepage = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [animatedStats, setAnimatedStats] = useState({});

  const quickStats = [
    { label: 'FIRs Registered Today', value: '1,247', target: 1247 },
    { label: 'Cases Under Investigation', value: '15,832', target: 15832 },
    { label: 'Cases Resolved This Month', value: '3,456', target: 3456 },
    { label: 'Police Stations Online', value: '2,847', target: 2847 }
  ];

  // Counter animation effect
  useEffect(() => {
    const animateNumbers = () => {
      quickStats.forEach((stat, index) => {
        const target = stat.target;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 50); // Update every 50ms
        let current = 0;
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          
          setAnimatedStats(prev => ({
            ...prev,
            [index]: current < 1000 ? 
              Math.floor(current).toString() : 
              Math.floor(current).toLocaleString()
          }));
        }, 50);
      });
    };

    // Start animation after a delay
    const timeout = setTimeout(animateNumbers, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const announcements = [
    {
      date: '25 Jan 2025',
      title: 'New Online FIR Categories Added',
      description: 'Cybercrime and financial fraud categories now available for online filing.'
    },
    {
      date: '20 Jan 2025', 
      title: 'System Maintenance Notice',
      description: 'Scheduled maintenance on 28th Jan from 2:00 AM to 4:00 AM.'
    },
    {
      date: '15 Jan 2025',
      title: 'Enhanced Security Features',
      description: 'Two-factor authentication now mandatory for all FIR submissions.'
    }
  ];

  const handleAdminLogin = (e) => {
    e.preventDefault();
    playClickSound();
    showAdminToast('Admin login functionality will be implemented here', 'info');
    setShowAdminLogin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-page-enter">
      
      {/* SECTION 1: Hero & Main Actions */}
      <div className="bg-white border-b-4 border-orange-500 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center mb-12 hero-float">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Online First Information Report (FIR) System
            </h1>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              A secure and transparent platform for filing FIRs online. Submit your complaint 24x7 
              and track its progress in real-time through the official government portal.
            </p>
          </div>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 stagger-enhanced-1">
            <Link 
              to="/file-fir"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-lg font-bold text-xl shadow-lg btn-enhanced hover-lift focus-indicator flex items-center glow-on-hover"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              File New FIR
            </Link>
            <Link 
              to="/status"
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 rounded-lg font-bold text-xl shadow-lg btn-enhanced hover-lift focus-indicator flex items-center glow-on-hover"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              Track FIR Status
            </Link>
          </div>

          {/* Statistics Bar */}
          <div className="bg-blue-900 text-white rounded-xl p-8 shadow-lg stagger-enhanced-2 relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {quickStats.map((stat, index) => (
                <div key={index} className={`text-center stat-counter stagger-enhanced-${index + 1}`} style={{'--delay': `${index * 0.2}s`}}>
                  <div className="stat-number text-3xl font-bold text-orange-400 mb-2">
                    {animatedStats[index] || '0'}
                  </div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SECTION 2: Main Services (Left - 2/3 width) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-slide-in-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b-2 border-blue-900 pb-4">
                Online Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* File FIR Service */}
                <Link to="/file-fir" className="group" onClick={playClickSound}>
                  <div className="service-card-enhanced bg-green-50 border-2 border-green-200 rounded-xl p-8">
                    <div className="flex items-center mb-4">
                      <div className="service-icon text-4xl mr-4">📋</div>
                      <h3 className="text-xl font-bold text-gray-900">File FIR Online</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Submit First Information Report for non-serious crimes. Complete the process in minutes with proper documentation and verification.
                    </p>
                  </div>
                </Link>

                {/* Track Status Service */}
                <Link to="/status" className="group" onClick={playClickSound}>
                  <div className="service-card-enhanced bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
                    <div className="flex items-center mb-4">
                      <div className="service-icon text-4xl mr-4">🔍</div>
                      <h3 className="text-xl font-bold text-gray-900">Track FIR Status</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Check the current status of your filed FIR. Get real-time updates on investigation progress and case developments.
                    </p>
                  </div>
                </Link>

                {/* Download Forms Service */}
                <Link to="/resources" className="group" onClick={playClickSound}>
                  <div className="service-card-enhanced bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
                    <div className="flex items-center mb-4">
                      <div className="service-icon text-4xl mr-4">📄</div>
                      <h3 className="text-xl font-bold text-gray-900">Download Forms</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Access official police forms, legal documents, and resources. Download forms for offline submission and reference.
                    </p>
                  </div>
                </Link>

                {/* Contact Police Service */}
                <Link to="/contact" className="group" onClick={playClickSound}>
                  <div className="service-card-enhanced bg-red-50 border-2 border-red-200 rounded-xl p-8">
                    <div className="flex items-center mb-4">
                      <div className="service-icon text-4xl mr-4">🚔</div>
                      <h3 className="text-xl font-bold text-gray-900">Contact Police</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Find nearest police station, contact details, and officer information. Get direct assistance and support.
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-8 shadow-sm animate-slide-in-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="service-icon">
                    <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3">Important Notice</h3>
                  <div className="text-yellow-700 space-y-2">
                    <p>• Online FIR facility is available for non-serious cognizable offenses only</p>
                    <p>• For serious crimes like murder, rape, kidnapping, visit the nearest police station</p>
                    <p>• False information in FIR is punishable under Indian Penal Code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Sidebar (Right - 1/3 width) */}
          <div className="lg:col-span-1 space-y-8 sidebar-enhanced">
            
            {/* Police Admin Login */}
            <div className="admin-panel-card text-white rounded-xl p-6 shadow-lg card-interactive">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <div className="service-icon mr-2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Police Officer Login
              </h3>
              {!showAdminLogin ? (
                <button
                  onClick={() => {
                    playClickSound();
                    setShowAdminLogin(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold btn-enhanced focus-indicator flex items-center justify-center"
                >
                  <div className="service-icon mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  Admin Access
                </button>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4 animate-scale-in form-enhanced">
                  <div>
                    <input
                      type="text"
                      placeholder="Officer ID"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 form-input-enhanced focus-indicator"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 form-input-enhanced focus-indicator"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold btn-enhanced focus-indicator"
                      onClick={playClickSound}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setShowAdminLogin(false);
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold btn-enhanced focus-indicator"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <p className="text-xs text-slate-400 mt-3 text-center">
                For authorized police personnel only
              </p>
            </div>

            {/* Emergency Numbers */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm card-interactive">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                <div className="service-icon mr-2 emergency-pulse">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                Emergency Numbers
              </h3>
              <div className="space-y-3">
                <div className="emergency-card flex justify-between items-center py-2 border-b border-red-200 rounded p-2">
                  <span className="text-red-800 font-medium">Police Emergency</span>
                  <span className="emergency-number font-bold text-red-900 text-xl">100</span>
                </div>
                <div className="emergency-card flex justify-between items-center py-2 border-b border-red-200 rounded p-2">
                  <span className="text-red-800 font-medium">Fire Emergency</span>
                  <span className="emergency-number font-bold text-red-900 text-xl">101</span>
                </div>
                <div className="emergency-card flex justify-between items-center py-2 border-b border-red-200 rounded p-2">
                  <span className="text-red-800 font-medium">Medical Emergency</span>
                  <span className="emergency-number font-bold text-red-900 text-xl">102</span>
                </div>
                <div className="emergency-card flex justify-between items-center py-2 rounded p-2">
                  <span className="text-red-800 font-medium">Women Helpline</span>
                  <span className="emergency-number font-bold text-red-900 text-xl">1091</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Latest Announcements
              </h3>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div key={index} className="announcement-card border-l-4 border-blue-500 pl-4 py-2 rounded-r">
                    <div className="announcement-date text-xs text-gray-500 mb-1">{announcement.date}</div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">{announcement.title}</h4>
                    <p className="text-gray-700 text-xs leading-relaxed">{announcement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Quick Links Footer */}
        <div className="mt-16 bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center border-b border-gray-200 pb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              to="/resources" 
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              Find Police Station
            </Link>
            <Link 
              to="/resources" 
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Download Forms
            </Link>
            <Link 
              to="/resources" 
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
              onClick={playClickSound}
            >
              <div className="service-icon mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Government Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600 border-t border-gray-200 pt-8">
          <p className="mb-2 font-medium">
            This portal is developed and maintained by the Ministry of Home Affairs, Government of India
          </p>
          <p>
            Last updated: January 25, 2025 | Best viewed in Chrome, Firefox, Safari
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
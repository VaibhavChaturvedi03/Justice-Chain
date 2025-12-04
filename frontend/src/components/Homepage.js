import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showAdminToast } from "../utils/toastManager";
import { playClickSound } from "../utils/soundManager";

const Homepage = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });
  const [animatedStats, setAnimatedStats] = useState({});

  const quickStats = [
    { label: "FIRs Registered Today", value: "1,247", target: 1247 },
    { label: "Cases Under Investigation", value: "15,832", target: 15832 },
    { label: "Cases Resolved This Month", value: "3,456", target: 3456 },
    { label: "Police Stations Online", value: "2,847", target: 2847 },
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

          setAnimatedStats((prev) => ({
            ...prev,
            [index]:
              current < 1000
                ? Math.floor(current).toString()
                : Math.floor(current).toLocaleString(),
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
      date: "25 Jan 2025",
      title: "New Online FIR Categories Added",
      description:
        "Cybercrime and financial fraud categories now available for online filing.",
    },
    {
      date: "20 Jan 2025",
      title: "System Maintenance Notice",
      description: "Scheduled maintenance on 28th Jan from 2:00 AM to 4:00 AM.",
    },
    {
      date: "15 Jan 2025",
      title: "Enhanced Security Features",
      description:
        "Two-factor authentication now mandatory for all FIR submissions.",
    },
  ];

  const handleAdminLogin = (e) => {
    e.preventDefault();
    showAdminToast(
      "Admin login functionality will be implemented here",
      "info"
    );
    setShowAdminLogin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-page-enter">
      {/* SECTION 1: Hero & Main Actions */}
       <div className="bg-gradient-to-b from-gray-50 to-white relative overflow-hidden min-h-screen flex items-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-3xl opacity-50"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-50 rounded-3xl opacity-50"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 bg-gray-200 rounded-2xl opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gray-100 rounded-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="text-center mb-16 hero-float">
            {/* Badge */}
            {/* <div className="inline-flex items-center bg-white border border-blue-200 rounded-full px-6 py-2 mb-8 shadow-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              <span className="text-blue-600 font-semibold text-sm">Blockchain-Powered Security</span>
            </div> */}
            
            {/* Main Heading */}
            <h1 className="text-6xl font-bold mb-6">
              <div className="text-gray-900">JusticeChain</div>
              <div className="text-blue-600">Tamper-Proof FIR</div>
              <div className="text-gray-900">Management System</div>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              A secure and transparent platform for filing FIRs online. Submit your complaint 24x7 
              and track its progress in real-time through blockchain-secured records.
            </p>
          </div>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 stagger-enhanced-1">
            <Link 
              to="/file-fir"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg btn-enhanced hover-lift focus-indicator flex items-center transition-all duration-300"
              onClick={playClickSound}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              File New FIR
            </Link>
            <Link 
              to="/status"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg btn-enhanced hover-lift focus-indicator flex items-center transition-all duration-300"
              onClick={playClickSound}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track FIR Status
            </Link>
          </div>
          {/* Statistics Bar */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-[#0a50c2]/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:shadow-lg bg-white"
                  style={{
                    borderTop: "3px solid #0a50c2",
                  }}
                >
                  {/* Number */}
                  <div className="text-3xl font-semibold mb-1 text-[#0a50c2]">
                    {animatedStats[index] || "0"}
                  </div>

                  {/* Label */}
                  <div className="text-sm font-medium text-[#fa7415]">
                    {stat.label}
                  </div>
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-slide-in-left">
              {/* Header Section */}
              <div className="text-center py-12 px-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="inline-block bg-blue-100 text-blue-600 px-6 py-2 rounded-full text-sm font-semibold mb-4">
                  Online Services
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Quick <span className="text-blue-600">Access Portal</span>
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Access all government services from one place
                </p>
              </div>

              {/* Services Grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* File FIR Service */}
                  <Link to="/file-fir" className="group" onClick={playClickSound}>
                    <div className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <div className="bg-gray-100 rounded-lg p-3 mr-4 flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">File FIR Online</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                        Submit First Information Report. Complete the process in minutes with proper documentation.
                      </p>
                    </div>
                  </Link>

                  {/* Track Status Service - Featured */}
                  <Link to="/status" className="group" onClick={playClickSound}>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-white h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <div className="bg-white/20 rounded-lg p-3 mr-4 flex-shrink-0">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">Track FIR Status</h3>
                        </div>
                      </div>
                      <p className="text-blue-50 leading-relaxed flex-grow">
                        Check real-time updates on investigation progress and case developments with our tracking system.
                      </p>
                    </div>
                  </Link>

                  {/* Download Forms Service */}
                  <Link to="/resources" className="group" onClick={playClickSound}>
                    <div className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <div className="bg-gray-100 rounded-lg p-3 mr-4 flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Download Forms</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                        Access official police forms and legal documents for offline submission and reference materials.
                      </p>
                    </div>
                  </Link>

                  {/* Contact Police Service */}
                  <Link to="/contact" className="group" onClick={playClickSound}>
                    <div className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <div className="bg-gray-100 rounded-lg p-3 mr-4 flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Police</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                        Find nearest police station, contact details and officer information.Get direct assistance and support.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            
          </div>

          {/* SECTION 3: Sidebar (Right - 1/3 width) */}
          <div className="lg:col-span-1 space-y-8 sidebar-enhanced">
            {/* Police Admin Login */}
            <div className="admin-panel-card text-white rounded-xl p-6 shadow-lg card-interactive">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <div className="service-icon mr-2">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                Police Officer Login
              </h3>
              {!showAdminLogin ? (
                <button
                  onClick={() => {
                    setShowAdminLogin(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold btn-enhanced focus-indicator flex items-center justify-center"
                >
                  <div className="service-icon mr-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  Admin Access
                </button>
              ) : (
                <form
                  onSubmit={handleAdminLogin}
                  className="space-y-4 animate-scale-in form-enhanced"
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Officer ID"
                      value={adminCredentials.username}
                      onChange={(e) =>
                        setAdminCredentials({
                          ...adminCredentials,
                          username: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 form-input-enhanced focus-indicator"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={adminCredentials.password}
                      onChange={(e) =>
                        setAdminCredentials({
                          ...adminCredentials,
                          password: e.target.value,
                        })
                      }
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

            {/* Announcements */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 text-center">
                Latest Announcements
              </h3>
              <div className="flex flex-col items-center justify-center space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="announcement-card border-l-4 border-blue-500 pl-4 py-2 rounded-r w-full max-w-xs text-left"
                  >
                    <div className="announcement-date text-xs text-gray-500 mb-1">
                      {announcement.date}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      {announcement.title}
                    </h4>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {announcement.description}
                    </p>
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
              to="https://www.passportindia.gov.in/psp/Police"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
            >
              <div className="service-icon mr-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              Find Police Station
            </Link>
            <Link
              to="/resources"
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
            >
              <div className="service-icon mr-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              Download Forms
            </Link>
            <Link
              to="/resources"
              state={{ openTab: "faq" }}
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
            >
              <div className="service-icon mr-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              FAQ
            </Link>
            <Link
              to="/contact"
              className="quick-link-enhanced text-blue-600 hover:text-blue-800 font-medium flex items-center p-4 bg-blue-50 rounded-lg focus-indicator"
            >
              <div className="service-icon mr-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Government Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600 border-t border-gray-200 pt-8">
          <p className="mb-2 font-medium">
            This portal is developed and maintained by the Ministry of Home
            Affairs, Government of India
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

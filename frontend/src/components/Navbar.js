import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    const userType = user?.userType || "citizen";
    logout(userType);
    window.location.href = "/";
  };

  const navItems = [
    {
      name: "Home",
      path: user?.userType === "admin" ? "admin-dashboard" : "/",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "File complaint",
      path: "/file-fir",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      protected: true,
      userType: "citizen",
    },
    {
      name: "Track Status",
      path: "/status",
      icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
    {
      name: "Resources",
      path: "/resources#guides",
      icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
    },
    {
      name: "Current Cases",
      path: "/current-cases",
      icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
    },
    {
      name: "Contact",
      path: "/contact",
      icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.protected && item.userType) {
      return user && user.userType === item.userType;
    }
    return true;
  });

  return (
    <>
      {/* Top Header */}
      <div style={{ backgroundColor: "#fa7415" }} className="text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center text-sm font-medium">
            <span>भारत सरकार | Government of India</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b-4" style={{ borderColor: "#fa7415" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Emblem */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#0a50c2" }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: "#fa7415" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                  <path
                    d="M12 4.5L4.5 8v7.5c0 4.155 2.885 7.305 7.5 8.25 4.615-.945 7.5-4.095 7.5-8.25V8L12 4.5z"
                    fill="white"
                  />
                  <circle cx="12" cy="12" r="3" fill="#fa7415" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#0a50c2" }}>
                  Justice Chain
                </h1>
                <p className="text-sm text-gray-600">
                  डिजिटल एफआईआर सिस्टम | Digital FIR System
                </p>
                <p className="text-xs text-blue-800">
                  Ministry of Home Affairs, Government of India
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-900">
                  Emergency Helpline
                </p>
                <p className="text-lg font-bold text-red-600">100</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-900">
                  Women Helpline
                </p>
                <p className="text-lg font-bold text-red-600">1091</p>
              </div>
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-blue-900 font-medium">
                      {user.userType === "citizen"
                        ? "Citizen"
                        : "Admin Officer"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.fullName || user.email}
                    </p>
                  </div>
                  <Link
                    to={
                      user.userType === "citizen"
                        ? "/citizen-dashboard"
                        : "/admin-dashboard"
                    }
                    className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-md ${
                      user.userType === "citizen"
                        ? "bg-blue-700 hover:bg-blue-600"
                        : "bg-green-700 hover:bg-green-600"
                    }`}
                  >
                    {user.userType === "citizen"
                      ? "🏛️ Dashboard"
                      : "👨‍💼 Admin Dashboard"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/citizen-login"
                    className="text-white flex items-center px-5 py-2 text-sm font-semibold rounded-lg 
            transition-all duration-300 shadow-lg hover:shadow-xl 
            transform hover:scale-105"
                    style={{
                      backgroundColor: "#0a50c2",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2b6fe0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0a50c2")
                    }
                  >
                    Citizen Login
                  </Link>
                  <Link
                    to="/admin-login"
                    className="text-white flex items-center px-5 py-2 text-sm font-semibold rounded-lg 
            transition-all duration-300 shadow-lg hover:shadow-xl 
            transform hover:scale-105"
                    style={{
                      backgroundColor: "#fb7414",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ff903e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fb7414")
                    }
                  >
                    Admin Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="shadow-lg" style={{ backgroundColor: "#0a50c2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path ? "border-b-2" : ""
                  }`}
                  style={{
                    color:
                      location.pathname === item.path ? "#fa7415" : "white",
                    borderBottomColor:
                      location.pathname === item.path
                        ? "#fa7415"
                        : "transparent",
                  }}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    style={{
                      color:
                        location.pathname === item.path ? "#fa7415" : "white",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.name}

                  {item.protected && (
                    <svg
                      className="w-3 h-3 ml-1"
                      style={{ color: "#fa7415" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden w-full flex justify-between items-center">
              <span className="text-white font-medium">Navigation</span>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2"
                style={{ color: "#fa7415" }}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium"
                  style={{
                    color:
                      location.pathname === item.path ? "#fa7415" : "white",
                    backgroundColor:
                      location.pathname === item.path
                        ? "rgba(250,116,21,0.2)"
                        : "transparent",
                  }}
                >
                  <svg
                    className="h-5 w-5 mr-3"
                    style={{
                      color:
                        location.pathname === item.path ? "#fa7415" : "white",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>

                  {item.name}

                  {item.protected && (
                    <svg
                      className="w-4 h-4 ml-2"
                      style={{ color: "#fa7415" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="border-t border-blue-700 pt-2 mt-2">
                {user ? (
                  <>
                    <Link
                      to={
                        user.userType === "citizen"
                          ? "/citizen-dashboard"
                          : "/admin-dashboard"
                      }
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                    >
                      {user.userType === "citizen"
                        ? "🏛️ Dashboard"
                        : "👨‍💼 Admin Dashboard"}
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700 w-full text-left"
                    >
                      Logout ({user.fullName || user.email})
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/citizen-login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                    >
                      🏛️ Citizen Login
                    </Link>
                    <Link
                      to="/admin-login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                    >
                      👨‍💼 Admin Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;  
import React, { useState, useEffect } from 'react';
import { FIRStorage } from '../utils/firStorage';

const TrackStatus = () => {
  const [searchType, setSearchType] = useState('fir');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize sample data on component mount
  useEffect(() => {
    try {
      FIRStorage.initializeSampleData();
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Search in localStorage
    setTimeout(() => {
      try {
        const result = FIRStorage.searchFIR(searchType, searchValue.trim());
        setSearchResult(result);
        setHasSearched(true);
        setIsSearching(false);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResult(null);
        setHasSearched(true);
        setIsSearching(false);
      }
    }, 1500);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'fir registered':
        return 'bg-blue-100 text-blue-800';
      case 'investigation started':
        return 'bg-yellow-100 text-yellow-800';
      case 'under investigation':
        return 'bg-orange-100 text-orange-800';
      case 'evidence collected':
        return 'bg-purple-100 text-purple-800';
      case 'case closed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track FIR Status</h1>
          <p className="text-xl text-gray-600">Get real-time updates on your case</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fir">FIR Number</option>
                  <option value="phone">Phone Number</option>
                  <option value="email">Email Address</option>
                  <option value="id">ID Number</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'fir' && 'FIR Number'}
                  {searchType === 'phone' && 'Phone Number'}
                  {searchType === 'email' && 'Email Address'}
                  {searchType === 'id' && 'ID Number'}
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === 'fir' ? 'Enter FIR number (e.g., FIR2025001234)' :
                    searchType === 'phone' ? 'Enter phone number' :
                    searchType === 'email' ? 'Enter email address' :
                    'Enter ID number'
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSearching || !searchValue.trim()}
                className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSearching || !searchValue.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Status
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results - Found Case */}
        {hasSearched && searchResult && (
          <div className="space-y-8">
            {/* Case Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Case Summary</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(searchResult.status)}`}>
                  {searchResult.status || 'Status Unknown'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">FIR Number</h3>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.firNumber || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Filed Date</h3>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.filedDate || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Type</h3>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.incidentType || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Complainant</h3>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.fullName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Police Station</h3>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.city ? `${searchResult.city} Police Station` : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Investigating Officer</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchResult.fullName ? `Inspector ${searchResult.fullName.split(' ')[0]} Sharma` : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Case Timeline</h2>
              <div className="space-y-6">
                {searchResult.timeline && Array.isArray(searchResult.timeline) ? 
                  searchResult.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{event.status || 'Update'}</h3>
                          <span className="text-sm text-gray-500">{event.date || 'Date Unknown'}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{event.description || 'No description available'}</p>
                        <p className="text-sm text-gray-500 mt-2">Officer: {event.officer || 'Unknown'}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500">No timeline information available.</p>
                  )
                }
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Next Steps</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900">Await Forensic Results</h3>
                    <p className="text-blue-700">Forensic analysis is in progress. Results expected within 7-10 days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900">Stay Available</h3>
                    <p className="text-blue-700">Keep your contact information updated. You may be contacted for additional information.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900">Updates via SMS/Email</h3>
                    <p className="text-blue-700">You'll receive automatic updates on your registered contact details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {hasSearched && !searchResult && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any records matching your search. Please check the information and try again.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Try with sample data</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    For demonstration, try searching with: <strong>FIR2025001234</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">support@justicechain.gov.in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">1800-XXX-XXXX (24/7 Helpline)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• How long does it take to update case status?</li>
                <li>• What if I lost my FIR number?</li>
                <li>• How to contact investigating officer?</li>
                <li>• When will my case be resolved?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;
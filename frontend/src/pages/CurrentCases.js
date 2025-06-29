import React, { useState, useEffect } from 'react';
import { FIRStorage } from '../utils/firStorage';

const CurrentCases = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load all FIRs from localStorage
    const allFIRs = FIRStorage.getAllFIRs();
    setCases(allFIRs);
    setFilteredCases(allFIRs);
  }, []);

  useEffect(() => {
    let filtered = cases;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(fir => fir.status === filter);
    }

    // Filter by search term (FIR number or incident type)
    if (searchTerm) {
      filtered = filtered.filter(fir => 
        fir.firNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fir.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  }, [filter, searchTerm, cases]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'under_review': 'badge-pending',
      'in_progress': 'badge-processing',
      'resolved': 'badge-approved',
      'closed': 'badge-rejected'
    };
    return statusClasses[status] || 'badge-pending';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'under_review': 'Under Review',
      'in_progress': 'In Progress', 
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusTexts[status] || 'Under Review';
  };

  const getPriorityBadge = (incidentType) => {
    // AI will determine priority later, for now using incident type
    const highPriorityTypes = ['Murder', 'Kidnapping', 'Assault/Violence', 'Domestic Violence'];
    const mediumPriorityTypes = ['Theft/Burglary', 'Fraud/Cybercrime', 'Harassment'];
    
    if (highPriorityTypes.includes(incidentType)) {
      return { class: 'bg-red-100 text-red-800 border-red-200', text: 'HIGH' };
    } else if (mediumPriorityTypes.includes(incidentType)) {
      return { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'MEDIUM' };
    } else {
      return { class: 'bg-green-100 text-green-800 border-green-200', text: 'LOW' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Current Cases</h1>
          <p className="text-xl text-gray-600">Track all active FIR cases in the system</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Cases</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Cases</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by FIR number or incident type..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
            <p className="mt-1 text-sm text-gray-500">No FIR cases match your current filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((fir) => {
              const priority = getPriorityBadge(fir.incidentType);
              return (
                <div key={fir.firNumber} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{fir.firNumber}</h3>
                        <p className="text-sm text-gray-600">Filed: {formatDate(fir.submittedAt)}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`${getStatusBadge(fir.status)} text-xs`}>
                          {getStatusText(fir.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium border rounded ${priority.class}`}>
                          {priority.text} PRIORITY
                        </span>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Incident Type</h4>
                        <p className="text-sm text-gray-600">{fir.incidentType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Date of Incident</h4>
                        <p className="text-sm text-gray-600">{formatDate(fir.incidentDate)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Location</h4>
                        <p className="text-sm text-gray-600 truncate">{fir.incidentLocation}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Case ID: {fir.id}</span>
                        <span>Last Updated: {formatDate(fir.lastUpdated || fir.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{cases.length}</div>
            <div className="text-sm text-gray-600">Total Cases</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {cases.filter(c => c.status === 'under_review').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {cases.filter(c => c.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {cases.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Privacy Protection</h4>
              <p className="text-sm text-blue-700 mt-1">
                Personal information of citizens is protected and not displayed in this public view. 
                Only case status, incident type, and non-sensitive details are shown to maintain privacy while ensuring transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCases;
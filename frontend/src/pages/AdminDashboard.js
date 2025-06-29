import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../utils/auth';
import { FIRStorage } from '../utils/firStorage';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [allFIRs, setAllFIRs] = useState([]);
  const [filteredFIRs, setFilteredFIRs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [stats, setStats] = useState({});
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const authUser = AuthService.isAuthenticated('admin');
    if (!authUser) {
      navigate('/admin-login');
      return;
    }
    setUser(authUser);

    // Load all FIRs
    const firs = FIRStorage.getAllFIRs();
    setAllFIRs(firs);
    setFilteredFIRs(firs);

    // Calculate statistics
    const statistics = FIRStorage.getStatistics();
    setStats(statistics);
  }, [navigate]);

  useEffect(() => {
    // Filter FIRs based on status
    let filtered = allFIRs;
    if (filterStatus !== 'all') {
      filtered = allFIRs.filter(fir => 
        fir.status.toLowerCase().includes(filterStatus.toLowerCase())
      );
    }

    // Sort FIRs
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.filedDate) - new Date(a.filedDate));
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      filtered.sort((a, b) => 
        (priorityOrder[b.urgencyLevel] || 0) - (priorityOrder[a.urgencyLevel] || 0)
      );
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => a.incidentType.localeCompare(b.incidentType));
    }

    setFilteredFIRs(filtered);
  }, [allFIRs, filterStatus, sortBy]);

  const handleLogout = () => {
    AuthService.logout('admin');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'fir registered':
        return 'bg-blue-100 text-blue-800';
      case 'under investigation':
        return 'bg-orange-100 text-orange-800';
      case 'case closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateFIRStatus = (firNumber, newStatus) => {
    const result = FIRStorage.updateFIRStatus(
      firNumber, 
      newStatus, 
      `Status updated by admin officer`,
      'Admin Officer'
    );
    
    if (result.success) {
      // Refresh the FIRs list
      const updatedFIRs = FIRStorage.getAllFIRs();
      setAllFIRs(updatedFIRs);
      alert('FIR status updated successfully!');
    } else {
      alert('Failed to update FIR status');
    }
  };

  const viewFIRDetails = (fir) => {
    setSelectedFIR(fir);
    setShowModal(true);
  };

  const closeFIRModal = () => {
    setSelectedFIR(null);
    setShowModal(false);
  };

  const FIRDetailsModal = ({ fir, onClose }) => {
    if (!fir) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">FIR Details</h2>
                <p className="text-sm text-gray-600">{fir.firNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* FIR Content */}
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{fir.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Father's Name</label>
                    <p className="text-sm text-gray-900">{fir.fatherName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <p className="text-sm text-gray-900">{fir.age}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-sm text-gray-900">{fir.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{fir.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{fir.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">{fir.address}, {fir.city}, {fir.state} - {fir.pincode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Type</label>
                    <p className="text-sm text-gray-900">{fir.idType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Number</label>
                    <p className="text-sm text-gray-900">{fir.idNumber}</p>
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Incident Type</label>
                    <p className="text-sm text-gray-900">{fir.incidentType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Incident</label>
                    <p className="text-sm text-gray-900">{fir.incidentDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Time of Incident</label>
                    <p className="text-sm text-gray-900">{fir.incidentTime || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{fir.incidentLocation}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{fir.incidentDescription}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  {fir.suspectDetails && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Suspect Details</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{fir.suspectDetails}</p>
                    </div>
                  )}
                  {fir.witnessDetails && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Witness Details</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{fir.witnessDetails}</p>
                    </div>
                  )}
                  {fir.evidenceDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Evidence Description</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{fir.evidenceDescription}</p>
                    </div>
                  )}
                  {fir.previousComplaint && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Previous Complaint</label>
                      <p className="text-sm text-gray-900">Yes</p>
                      {fir.previousComplaintDetails && (
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{fir.previousComplaintDetails}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Timeline */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Status</label>
                    <p className="text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fir.status)}`}>
                        {fir.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Filed Date</label>
                    <p className="text-sm text-gray-900">{fir.filedDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900">{fir.lastUpdated || fir.filedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <select
                value={fir.status}
                onChange={(e) => {
                  updateFIRStatus(fir.firNumber, e.target.value);
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="FIR Registered">FIR Registered</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Evidence Collected">Evidence Collected</option>
                <option value="Case Closed">Case Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JusticeChain Admin</h1>
                <p className="text-sm text-gray-600">Officer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Admin Officer</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage FIR applications, track investigations, and update case status.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                <p className="text-sm text-gray-600">Total FIRs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.registered || 0}</p>
                <p className="text-sm text-gray-600">New FIRs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.underInvestigation || 0}</p>
                <p className="text-sm text-gray-600">Under Investigation</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.resolved || 0}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="registered">FIR Registered</option>
                  <option value="investigation">Under Investigation</option>
                  <option value="closed">Case Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date">Date Filed</option>
                  <option value="priority">Priority</option>
                  <option value="type">Incident Type</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredFIRs.length} of {allFIRs.length} FIRs
            </div>
          </div>
        </div>

        {/* FIRs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">FIR Cases</h3>
            <p className="text-sm text-gray-600">Manage and track all FIR applications</p>
          </div>

          {filteredFIRs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No FIRs Found</h4>
              <p className="text-gray-600">No FIRs match your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complainant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFIRs.map((fir) => (
                    <tr key={fir.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fir.firNumber}</div>
                          <div className="text-sm text-gray-500">{fir.incidentType}</div>
                          <div className="text-xs text-gray-400">Filed: {fir.filedDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fir.fullName}</div>
                          <div className="text-sm text-gray-500">{fir.phone}</div>
                          <div className="text-xs text-gray-400">{fir.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(fir.urgencyLevel)}`}>
                          {fir.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fir.status)}`}>
                          {fir.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewFIRDetails(fir)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                          <select
                            value={fir.status}
                            onChange={(e) => updateFIRStatus(fir.firNumber, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="FIR Registered">FIR Registered</option>
                            <option value="Under Investigation">Under Investigation</option>
                            <option value="Evidence Collected">Evidence Collected</option>
                            <option value="Case Closed">Case Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* FIR Details Modal */}
      {showModal && (
        <FIRDetailsModal fir={selectedFIR} onClose={closeFIRModal} />
      )}
    </div>
  );
};

export default AdminDashboard;
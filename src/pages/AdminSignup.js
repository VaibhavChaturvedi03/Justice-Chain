import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    empId: '',
    department: '',
    designation: '',
    officeAddress: '',
    state: '',
    city: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword || !formData.empId) {
      return 'Please fill in all required fields';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (!formData.email.includes('.gov.in')) {
      return 'Please use an official government email address ending with .gov.in';
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return 'Please enter a valid 10-digit phone number';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        empId: formData.empId,
        department: formData.department,
        designation: formData.designation,
        officeAddress: formData.officeAddress,
        state: formData.state,
        city: formData.city,
        password: formData.password
      });

      if (res.data.message === 'Admin registered successfully') {
        setSuccess('Admin registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      } else {
        setError('Something went wrong, please try again.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response.data.message === 'Admin already exists') {
        setError('Admin with this email already exists.');
      } else {
        setError('Server error, please try again later.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">JusticeChain</h2>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">👨‍💼 Admin Registration</h1>
          <p className="mt-2 text-sm text-gray-600">Create administrative account for JusticeChain portal</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Account Registration</h3>
            <p className="text-sm text-gray-600">Use valid government email (.gov.in)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">{success}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input name="fullName" type="text" required value={formData.fullName} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter Full Name"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Official Email *</label>
                <input name="email" type="email" required value={formData.email} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="name@department.gov.in"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="10-digit phone"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                <input name="empId" type="text" required value={formData.empId} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter Employee ID"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input name="password" type="password" required value={formData.password} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Password (min 8 chars)"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Confirm Password"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input name="department" type="text" value={formData.department} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter Department"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input name="designation" type="text" value={formData.designation} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter Designation"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
                <input name="officeAddress" type="text" value={formData.officeAddress} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter Office Address"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input name="state" type="text" value={formData.state} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter State"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input name="city" type="text" value={formData.city} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter City"/>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}>
              {isLoading ? 'Creating Account...' : '🔐 Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/admin-login')} className="text-green-600 hover:text-green-500 font-medium">Login here</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;



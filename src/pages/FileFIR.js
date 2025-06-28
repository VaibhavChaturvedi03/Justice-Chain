import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FIRStorage } from '../utils/firStorage';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FileFIR = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information - Pre-filled from logged in user
    fullName: '',
    fatherName: '',
    age: '',
    gender: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: user?.email || '',
    idType: '',
    idNumber: '',

    // Incident Details
    incidentType: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',
    suspectDetails: '',
    witnessDetails: '',
    evidenceDescription: '',

    // Additional Information
    previousComplaint: false,
    previousComplaintDetails: '',
    preferredLanguage: 'english',

    // Media Files
    mediaFiles: []
  });

  const [uploadingFiles, setUploadingFiles] = useState(false);

  const incidentTypes = [
    'Theft/Burglary',
    'Fraud/Cybercrime',
    'Assault/Violence',
    'Property Dispute',
    'Missing Person',
    'Domestic Violence',
    'Road Accident',
    'Harassment',
    'Kidnapping',
    'Murder',
    'Other'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For phone number, only allow digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);

    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // Check file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`);
          resolve(null);
          return;
        }

        // Check file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
          'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} has unsupported format. Please upload images, videos, or documents only.`);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result, // This will be base64
            uploadDate: new Date().toISOString()
          });
        };
        reader.onerror = () => {
          alert(`Error reading file ${file.name}`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(filePromises);
      const validFiles = results.filter(file => file !== null);

      setFormData(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...validFiles]
      }));

      if (validFiles.length > 0) {
        alert(`Successfully uploaded ${validFiles.length} file(s)`);
      }
    } catch (error) {
      alert('Error uploading files. Please try again.');
      console.error('File upload error:', error);
    } finally {
      setUploadingFiles(false);
      e.target.value = ''; // Clear the input
    }
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const validateStep = (step) => {
    const errors = [];

    if (step === 1) {
      if (!formData.fullName.trim()) errors.push('Full Name is required');
      if (!formData.fatherName.trim()) errors.push('Father\'s Name is required');
      if (!formData.age || formData.age < 1 || formData.age > 120) errors.push('Valid age is required');
      if (!formData.gender) errors.push('Gender is required');
      if (!formData.phone.trim()) errors.push('Phone number is required');
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) errors.push('Valid Indian phone number is required');
      if (!formData.address.trim()) errors.push('Address is required');
      if (!formData.city.trim()) errors.push('City is required');
      if (!formData.state) errors.push('State is required');
      if (!formData.pincode.trim()) errors.push('Pincode is required');
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) errors.push('Valid 6-digit pincode is required');
      if (!formData.idType) errors.push('ID Type is required');
      if (!formData.idNumber.trim()) errors.push('ID Number is required');
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Valid email address is required');
    }

    if (step === 2) {
      if (!formData.incidentType) errors.push('Incident type is required');
      if (!formData.incidentDate) errors.push('Incident date is required');
      if (!formData.incidentLocation.trim()) errors.push('Incident location is required');
      if (!formData.incidentDescription.trim()) errors.push('Incident description is required');
      if (formData.incidentDescription.trim().length < 20) errors.push('Incident description must be at least 20 characters');
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);

    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = async () => {
    const allErrors = [];
    for (let step = 1; step <= 3; step++) {
      const stepErrors = validateStep(step);
      allErrors.push(...stepErrors);
    }

    if (allErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + allErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    let severity = 1;
    let urgencyLevel = 'low';
    console.log("Sending to AI:", formData.incidentDescription);


    try {
      const airesponse = await axios.post('http://127.0.0.1:5050/classify',
        {incidentDescription : formData.incidentDescription || '' }
      )
      console.log("AI Raw Response:", airesponse.data);

      const priority = airesponse.data.priority.toLowerCase();
       console.log("Parsed priority:", priority);

      if (priority === 'high') {
        severity = 3;
        urgencyLevel = 'high';
      } else if (priority === 'medium') {
        severity = 2;
        urgencyLevel = 'medium';
      }
    } catch(AIerror){
      console.log("AI Response Error:", AIerror.message);
    }

    const firDataWithUser = {
      ...formData,
      severity,
      urgencyLevel,
      filedByUser: {
        email: user.email,
        fullName: user.fullName || user.email,
        userType: user.userType,
        loginTime: user.loginTime
      }
    };
    console.log("Saving FIR locally:", firDataWithUser);


    FIRStorage.saveFIR(firDataWithUser);


    try {
      const response = await fetch('http://localhost:4000/api/uploadFIR', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(firDataWithUser)
      });

      if (!response.ok) {
        // If server returned non-200 status, read text and show
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      alert("FIR SUBMITTED")

      if (result.success) {

        // Reset form after success:
        setFormData({
          fullName: '',
          fatherName: '',
          age: '',
          gender: '',
          occupation: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          phone: '',
          email: user?.email || '',
          idType: '',
          idNumber: '',
          incidentType: '',
          incidentDate: '',
          incidentTime: '',
          incidentLocation: '',
          incidentDescription: '',
          suspectDetails: '',
          witnessDetails: '',
          evidenceDescription: '',
          previousComplaint: false,
          previousComplaintDetails: '',
          preferredLanguage: 'english',
          mediaFiles: []
        });

        setCurrentStep(1);

        setTimeout(() => {
          navigate('/citizen-dashboard')
        }, 1000);

      } else {
        alert('❌ FIR submission failed: ' + (result.message || 'Unknown error.'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Network or server error: ' + err.message);
    }

    setIsSubmitting(false);
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">File FIR Online</h1>
          <p className="text-xl text-gray-600">Secure, Fast, and Transparent</p>

          {/* User Authentication Status */}
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">
              Authenticated as: {user?.fullName || user?.email}
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
                }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Form content without form tag around steps to prevent auto-submission */}
          <div>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your occupation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Pre-filled from login)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter email address"
                      readOnly
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter complete address"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type *</label>
                    <select
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="voter">Voter ID</option>
                      <option value="driving">Driving License</option>
                      <option value="passport">Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ID number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Incident Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type of Incident *</label>
                    <select
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Incident Type</option>
                      {incidentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Incident *</label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time of Incident</label>
                    <input
                      type="time"
                      name="incidentTime"
                      value={formData.incidentTime}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location of Incident *</label>
                    <textarea
                      name="incidentLocation"
                      value={formData.incidentLocation}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide detailed location where the incident occurred"
                      required
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description *</label>
                    <textarea
                      name="incidentDescription"
                      value={formData.incidentDescription}
                      onChange={handleInputChange}
                      rows="5"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide a detailed description of what happened. Include all relevant facts and circumstances."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suspect Details (if known)</label>
                    <textarea
                      name="suspectDetails"
                      value={formData.suspectDetails}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide any information about the suspect(s) - name, description, address, etc."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Witness Details (if any)</label>
                    <textarea
                      name="witnessDetails"
                      value={formData.witnessDetails}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide witness information - names, contact details, what they witnessed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Description</label>
                    <textarea
                      name="evidenceDescription"
                      value={formData.evidenceDescription}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe any evidence available - photos, videos, documents, physical evidence, etc."
                    ></textarea>
                  </div>

                  {/* Media Upload Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📎 Upload Evidence Files</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload photos, videos, or documents related to the incident. Supported formats: JPG, PNG, GIF, MP4, AVI, PDF, DOC, DOCX (Max 5MB per file)
                    </p>

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-blue-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-blue-500">Images, Videos, Documents (MAX 5MB each)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={uploadingFiles}
                        />
                      </label>
                    </div>

                    {uploadingFiles && (
                      <div className="mt-4 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                        </svg>
                        <span className="text-blue-600">Uploading files...</span>
                      </div>
                    )}

                    {/* Display uploaded files */}
                    {formData.mediaFiles.length > 0 && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Uploaded Files ({formData.mediaFiles.length})</h5>
                        <div className="space-y-2">
                          {formData.mediaFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 mr-3">
                                  {file.type.startsWith('image/') && (
                                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {file.type.startsWith('video/') && (
                                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                  )}
                                  {file.type.includes('pdf') && (
                                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {(file.type.includes('doc') || file.type.includes('word')) && (
                                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove file"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="previousComplaint"
                      checked={formData.previousComplaint}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Have you filed a complaint regarding this matter before?
                    </label>
                  </div>
                  {formData.previousComplaint && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous Complaint Details</label>
                      <textarea
                        name="previousComplaintDetails"
                        value={formData.previousComplaintDetails}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide details about the previous complaint - when, where, complaint number, etc."
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Your FIR</h3>

                {/* User Authentication Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Filed by Authenticated User</h4>
                  <p className="text-sm text-green-700">Email: {user?.email}</p>
                  <p className="text-sm text-green-700">Name: {user?.fullName || 'Not provided'}</p>
                  <p className="text-sm text-green-700">User Type: {user?.userType}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Personal Information</h4>
                      <p className="text-sm text-gray-600">Name: {formData.fullName}</p>
                      <p className="text-sm text-gray-600">Age: {formData.age}</p>
                      <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
                      <p className="text-sm text-gray-600">City: {formData.city}, {formData.state}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Incident Information</h4>
                      <p className="text-sm text-gray-600">Type: {formData.incidentType}</p>
                      <p className="text-sm text-gray-600">Date: {formData.incidentDate}</p>
                      {formData.incidentTime && (
                        <p className="text-sm text-gray-600">Time: {formData.incidentTime}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Incident Description</h4>
                    <p className="text-sm text-gray-600">{formData.incidentDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600">{formData.incidentLocation}</p>
                  </div>

                  {/* Show uploaded files */}
                  {formData.mediaFiles.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Attached Evidence Files</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.mediaFiles.map((file, index) => (
                          <div key={index} className="flex items-center bg-white p-2 rounded border">
                            <div className="flex-shrink-0 mr-2">
                              {file.type.startsWith('image/') && (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              )}
                              {file.type.startsWith('video/') && (
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              )}
                              {(file.type.includes('pdf') || file.type.includes('doc')) && (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.suspectDetails && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Suspect Details</h4>
                      <p className="text-sm text-gray-600">{formData.suspectDetails}</p>
                    </div>
                  )}

                  {formData.witnessDetails && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Witness Details</h4>
                      <p className="text-sm text-gray-600">{formData.witnessDetails}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Important Notice</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        By submitting this FIR, you confirm that all information provided is true and accurate to the best of your knowledge.
                        False information in an FIR is a punishable offense under Indian law.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Ready to Submit</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Please review all information carefully. Click the "Submit FIR" button below to file your complaint.
                        You will receive a unique FIR number for tracking purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Next
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit FIR
                      <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Need Help?</h3>
              <p className="text-blue-700 mt-1">
                If you need assistance filling out this form, please call our helpline at <strong>1800-XXX-XXXX</strong> or
                visit your nearest police station. Our support team is available 24/7 to help you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileFIR;

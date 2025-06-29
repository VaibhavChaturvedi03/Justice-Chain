import React, { useState } from 'react';
import { showDownloadToast } from '../utils/toastManager';
import { playClickSound } from '../utils/soundManager';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('forms');

  const downloadForms = [
    {
      title: 'FIR Form (Physical Copy)',
      description: 'Downloadable FIR form for offline submission',
      fileSize: '2.5 MB',
      fileType: 'PDF',
      downloads: '25,000+',
      category: 'forms'
    },
    {
      title: 'Complaint Form',
      description: 'General complaint form for non-criminal matters',
      fileSize: '1.8 MB',
      fileType: 'PDF',
      downloads: '15,000+',
      category: 'forms'
    },
    {
      title: 'Witness Statement Form',
      description: 'Form for recording witness statements',
      fileSize: '2.1 MB',
      fileType: 'PDF',
      downloads: '8,500+',
      category: 'forms'
    },
    {
      title: 'Evidence Submission Form',
      description: 'Form for submitting physical evidence',
      fileSize: '1.9 MB',
      fileType: 'PDF',
      downloads: '12,000+',
      category: 'forms'
    }
  ];

  const legalGuides = [
    {
      title: 'Your Rights During Investigation',
      description: 'Complete guide to citizen rights during police investigation',
      fileSize: '5.2 MB',
      fileType: 'PDF',
      downloads: '45,000+',
      category: 'guides'
    },
    {
      title: 'How to File an FIR',
      description: 'Step-by-step guide for filing First Information Report',
      fileSize: '4.8 MB',
      fileType: 'PDF',
      downloads: '60,000+',
      category: 'guides'
    },
    {
      title: 'Understanding Legal Procedures',
      description: 'Comprehensive guide to Indian legal system',
      fileSize: '8.5 MB',
      fileType: 'PDF',
      downloads: '35,000+',
      category: 'guides'
    },
    {
      title: 'Victim Support Services',
      description: 'Information about available support services',
      fileSize: '3.2 MB',
      fileType: 'PDF',
      downloads: '20,000+',
      category: 'guides'
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to register an FIR?',
      answer: 'FIR registration is typically completed within 30 minutes of submission. Online FIRs are processed immediately, while physical submissions may take up to 2-3 hours during peak times.',
      category: 'general'
    },
    {
      question: 'Can I file an FIR online for any type of crime?',
      answer: 'Most non-serious crimes can be filed online. However, serious crimes like murder, rape, or kidnapping require physical presence at the police station for proper verification and documentation.',
      category: 'filing'
    },
    {
      question: 'What documents do I need to file an FIR?',
      answer: 'You need a valid government-issued ID (Aadhaar, PAN, Voter ID, etc.), proof of address, and any evidence related to the incident. Additional documents may be required based on the nature of the crime.',
      category: 'filing'
    },
    {
      question: 'How can I track the status of my FIR?',
      answer: 'You can track your FIR status using your FIR number, registered phone number, or email address through our Track Status page. You\'ll also receive SMS/email updates automatically.',
      category: 'tracking'
    },
    {
      question: 'What if I made an error in my FIR?',
      answer: 'Contact the investigating officer immediately to correct any errors. Minor corrections can be made with a supplementary statement, while major changes may require filing a new FIR.',
      category: 'general'
    },
    {
      question: 'Can I withdraw my FIR after filing?',
      answer: 'FIRs for non-compoundable offenses cannot be withdrawn. For compoundable offenses, you need to file a withdrawal application with proper justification and court approval.',
      category: 'general'
    },
    {
      question: 'How long does a typical investigation take?',
      answer: 'Investigation timelines vary by case complexity. Simple cases are typically resolved within 30-60 days, while complex cases may take 3-6 months. You can track progress through our status tracking system.',
      category: 'tracking'
    },
    {
      question: 'What happens if the police refuse to file my FIR?',
      answer: 'If police refuse to file your FIR, you can approach the Superintendent of Police, file a complaint with the Human Rights Commission, or send a written complaint to the Magistrate.',
      category: 'general'
    }
  ];

  const emergencyContacts = [
    {
      service: 'Police Emergency',
      number: '100',
      description: 'For immediate police assistance',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
      service: 'Fire Emergency',
      number: '101',
      description: 'For fire-related emergencies',
      icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z'
    },
    {
      service: 'Medical Emergency',
      number: '102',
      description: 'For medical emergencies and ambulance',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    {
      service: 'Women Helpline',
      number: '1091',
      description: 'For women in distress',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      service: 'Child Helpline',
      number: '1098',
      description: 'For child protection and assistance',
      icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      service: 'Justice Chain Support',
      number: '1800-XXX-XXXX',
      description: '24/7 technical support',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ];

  const tabs = [
    { id: 'forms', label: 'Download Forms', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'guides', label: 'Legal Guides', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'faq', label: 'FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'contacts', label: 'Emergency Contacts', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }
  ];

  const handleDownload = (fileName) => {
    playClickSound();
    showDownloadToast(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-hero-enter">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Resources</h1>
          <p className="text-xl text-gray-600">Everything you need to know about legal procedures and rights</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 animate-fade-in">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 py-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium tab-button focus-indicator whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Forms Tab */}
            {activeTab === 'forms' && (
              <div className="tab-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Downloadable Forms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {downloadForms.map((form, index) => (
                    <div key={index} className={`bg-gray-50 rounded-xl p-6 card-interactive animate-stagger-${(index % 4) + 1}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{form.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{form.fileType}</span>
                            <span>•</span>
                            <span>{form.fileSize}</span>
                            <span>•</span>
                            <span>{form.downloads} downloads</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(form.title)}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 btn-animate focus-indicator flex items-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <div className="tab-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {legalGuides.map((guide, index) => (
                    <div key={index} className={`bg-gray-50 rounded-xl p-6 card-interactive animate-stagger-${(index % 4) + 1}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{guide.fileType}</span>
                            <span>•</span>
                            <span>{guide.fileSize}</span>
                            <span>•</span>
                            <span>{guide.downloads} downloads</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(guide.title)}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 btn-animate focus-indicator flex items-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="tab-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className={`bg-gray-50 rounded-xl p-6 card-interactive animate-stagger-${(index % 4) + 1}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="tab-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className={`bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 card-interactive animate-stagger-${(index % 4) + 1}`}>
                      <div className="flex items-center mb-4">
                        <div className="bg-red-100 p-3 rounded-lg mr-4">
                          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={contact.icon} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{contact.service}</h3>
                          <p className="text-2xl font-bold text-red-600">{contact.number}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{contact.description}</p>
                      <button 
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 btn-animate focus-indicator flex items-center"
                        onClick={playClickSound}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Aid Services</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Free Legal Consultation</h3>
                  <p className="text-gray-600 text-sm">Get free legal advice from qualified lawyers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Document Assistance</h3>
                  <p className="text-gray-600 text-sm">Help with legal document preparation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Court Representation</h3>
                  <p className="text-gray-600 text-sm">Legal representation for eligible cases</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Online Services</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">e-FIR Filing</h3>
                  <p className="text-gray-600 text-sm">File FIR online from anywhere</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Case Tracking</h3>
                  <p className="text-gray-600 text-sm">Real-time case status updates</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Digital Evidence</h3>
                  <p className="text-gray-600 text-sm">Upload and manage case evidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
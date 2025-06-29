// LocalStorage utility for managing FIR data
export class FIRStorage {
  static STORAGE_KEY = 'justice_chain_firs';
  
  // Generate unique FIR number
  static generateFIRNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FIR${year}${random}${timestamp.toString().slice(-4)}`;
  }

  // Generate case ID for internal tracking
  static generateCaseId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Save FIR to localStorage
  static saveFIR(firData) {
    try {
      const existingFIRs = this.getAllFIRs();
      const firNumber = this.generateFIRNumber();
      const caseId = this.generateCaseId();
      
      const newFIR = {
        id: caseId,
        firNumber: firNumber,
        ...firData,
        status: 'FIR Registered',
        filedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        timeline: [{
          date: new Date().toISOString().split('T')[0],
          status: 'FIR Registered',
          description: 'FIR registered successfully in the system',
          officer: 'System Administrator'
        }]
      };

      const updatedFIRs = [...existingFIRs, newFIR];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFIRs));
      
      return { success: true, firNumber, caseId };
    } catch (error) {
      console.error('Error saving FIR:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all FIRs from localStorage
  static getAllFIRs() {
    try {
      const firs = localStorage.getItem(this.STORAGE_KEY);
      return firs ? JSON.parse(firs) : [];
    } catch (error) {
      console.error('Error retrieving FIRs:', error);
      return [];
    }
  }

  // Search FIR by various criteria
  static searchFIR(searchType, searchValue) {
    try {
      const allFIRs = this.getAllFIRs();
      const searchValueLower = searchValue.toLowerCase().trim();
      
      const result = allFIRs.find(fir => {
        switch (searchType) {
          case 'fir':
            return fir.firNumber.toLowerCase().includes(searchValueLower);
          case 'phone':
            return fir.phone && fir.phone.includes(searchValue);
          case 'email':
            return fir.email && fir.email.toLowerCase().includes(searchValueLower);
          case 'id':
            return fir.idNumber && fir.idNumber.toLowerCase().includes(searchValueLower);
          default:
            return false;
        }
      });

      return result || null;
    } catch (error) {
      console.error('Error searching FIR:', error);
      return null;
    }
  }

  // Update FIR status and timeline
  static updateFIRStatus(firNumber, newStatus, description, officer = 'System') {
    try {
      const allFIRs = this.getAllFIRs();
      const firIndex = allFIRs.findIndex(fir => fir.firNumber === firNumber);
      
      if (firIndex === -1) {
        return { success: false, error: 'FIR not found' };
      }

      const updatedFIR = { ...allFIRs[firIndex] };
      updatedFIR.status = newStatus;
      updatedFIR.lastUpdated = new Date().toISOString().split('T')[0];
      
      // Add timeline entry
      updatedFIR.timeline.push({
        date: new Date().toISOString().split('T')[0],
        status: newStatus,
        description: description,
        officer: officer
      });

      allFIRs[firIndex] = updatedFIR;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allFIRs));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating FIR status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get FIR statistics
  static getStatistics() {
    try {
      const allFIRs = this.getAllFIRs();
      const total = allFIRs.length;
      const statuses = allFIRs.reduce((acc, fir) => {
        acc[fir.status] = (acc[fir.status] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        registered: statuses['FIR Registered'] || 0,
        underInvestigation: statuses['Under Investigation'] || 0,
        resolved: statuses['Case Closed'] || 0,
        pending: statuses['Pending'] || 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { total: 0, registered: 0, underInvestigation: 0, resolved: 0, pending: 0 };
    }
  }

  // Initialize sample data (for demo purposes)
  static initializeSampleData() {
    const existingFIRs = this.getAllFIRs();
    if (existingFIRs.length === 0) {
      const sampleFIRs = [
        {
          id: 'sample1',
          firNumber: 'FIR2025001234',
          fullName: 'Rajesh Kumar',
          fatherName: 'Ram Kumar',
          age: '35',
          gender: 'male',
          occupation: 'Business',
          address: '123 Model Town',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543210',
          email: 'rajesh.kumar@email.com',
          idType: 'aadhar',
          idNumber: '1234-5678-9012',
          incidentType: 'Theft/Burglary',
          incidentDate: '2025-01-15',
          incidentTime: '10:30',
          incidentLocation: 'Model Town Market',
          incidentDescription: 'Shop was broken into and cash was stolen',
          suspectDetails: 'Unknown suspects, approximately 2-3 people',
          witnessDetails: 'Security guard witnessed the incident',
          evidenceDescription: 'CCTV footage available, broken lock',
          status: 'Under Investigation',
          filedDate: '2025-01-15',
          lastUpdated: '2025-01-20',
          timeline: [
            {
              date: '2025-01-15',
              status: 'FIR Registered',
              description: 'FIR registered and assigned to investigating officer',
              officer: 'Sub-Inspector Amit Singh'
            },
            {
              date: '2025-01-17',
              status: 'Investigation Started',
              description: 'Crime scene investigation initiated',
              officer: 'Inspector Priya Sharma'
            },
            {
              date: '2025-01-20',
              status: 'Evidence Collected',
              description: 'Physical evidence collected and sent for forensic analysis',
              officer: 'Inspector Priya Sharma'
            }
          ]
        }
      ];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleFIRs));
    }
  }

  // Clear all data (for testing purposes)
  static clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
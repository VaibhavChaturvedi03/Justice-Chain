const API_BASE_URL = 'http://localhost:5000/api';

export class FIRStorage {
  // Search FIR by various criteria (public - no auth required)
  static async searchFIR(searchType, searchValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/publicSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchType: searchType,
          searchValue: searchValue
        })
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.results.length > 0) {
        return data.results[0]; // Return first result
      }
      
      return null;
    } catch (error) {
      console.error('Error searching FIR:', error);
      return null;
    }
  }

  // Get all FIRs for logged-in user
  static async getUserFIRs(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/getUserFIRs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.firs : [];
    } catch (error) {
      console.error('Error fetching user FIRs:', error);
      return [];
    }
  }

  // Get all FIRs (admin only)
  static async getAllFIRs(token, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/getAllFIRs?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.success ? { firs: data.firs, total: data.total, pages: data.pages } : { firs: [], total: 0, pages: 0 };
    } catch (error) {
      console.error('Error fetching all FIRs:', error);
      return { firs: [], total: 0, pages: 0 };
    }
  }

  // Get FIR by ID
  static async getFIRById(id, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/getFIR/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.fir : null;
    } catch (error) {
      console.error('Error fetching FIR:', error);
      return null;
    }
  }

  // Update FIR status
  static async updateFIRStatus(firId, status, description, officer, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/updateStatus/${firId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status,
          description: description,
          officer: officer
        })
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.success ? { success: true, fir: data.fir } : { success: false, error: 'Failed to update' };
    } catch (error) {
      console.error('Error updating FIR status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get FIR statistics
  static async getStatistics(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/getStatistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          total: data.total,
          registered: data.statuses['FIR Registered'] || 0,
          underInvestigation: data.statuses['Under Investigation'] || 0,
          resolved: data.statuses['Case Closed'] || 0,
          pending: data.statuses['Pending'] || 0
        };
      }
      
      return { total: 0, registered: 0, underInvestigation: 0, resolved: 0, pending: 0 };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { total: 0, registered: 0, underInvestigation: 0, resolved: 0, pending: 0 };
    }
  }

  // Get IPFS file
  static async getIPFSFile(firId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/getIPFSFile/${firId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.success ? { url: data.url, ipfsHash: data.ipfsHash } : null;
    } catch (error) {
      console.error('Error fetching IPFS file:', error);
      return null;
    }
  }

  // Download PDF
  static async downloadPDF(firId, firNumber, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/downloadFIR/${firId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${firNumber || 'fir'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      return false;
    }
  }

  // Upload media files (photos, videos) to a FIR
  static async uploadMediaToFIR(firId, files, token) {
    try {
      const formData = new FormData();
      
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch(`${API_BASE_URL}/uploadMedia/${firId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading media:', error);
      return { success: false, error: error.message };
    }
  }

  // Get media files for a FIR
  static async getMediaFiles(firId) {
    try {
      const response = await fetch(`${API_BASE_URL}/getMedia/${firId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.mediaFiles || [];
    } catch (error) {
      console.error('Error fetching media files:', error);
      return [];
    }
  }

  // Get direct Pinata URL for a media file
  static getPinataUrl(ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  // Backward compatibility: Initialize sample data (no longer needed but kept for compatibility)
  static initializeSampleData() {
    console.log('Sample data initialization is no longer needed. Data is stored in MongoDB.');
    return true;
  }

  // Backward compatibility: Generate FIR Number (now done on server)
  static generateFIRNumber() {
    // This is now done on server side, but kept for backward compatibility
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FIR${year}${random}${timestamp.toString().slice(-4)}`;
  }

  // Backward compatibility: Generate case ID
  static generateCaseId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// AuthService.js - uses real backend (MongoDB) on port 5000
export class AuthService {
  static CITIZEN_STORAGE_KEY = 'justice_chain_citizen_auth';
  static ADMIN_STORAGE_KEY = 'justice_chain_admin_auth';

  // Helper function to check if token is expired
  static isTokenExpired(token) {
    try {
      if (!token) return true;
      
      // Parse JWT (split by '.' to get payload)
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (err) {
      console.error('Error checking token expiration:', err);
      return true;
    }
  }

  // ---------- CITIZEN SIGNUP ----------
  static async signupCitizen(userData) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email.toLowerCase(),
          phone: userData.phone,
          password: userData.password
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'Registration failed' };

      return { success: true, message: data.message || 'Citizen registered successfully' };
    } catch (err) {
      return { success: false, error: 'Network or server error during citizen signup' };
    }
  }

  // ---------- CITIZEN LOGIN ----------
  static async loginCitizen(email, password) {
    try {
      console.log('Attempting citizen login with:', email);
      const res = await fetch('http://localhost:5000/api/auth/citizen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      });

      const data = await res.json();
      console.log('Citizen login response:', data);
      if (!res.ok) return { success: false, error: data.message || 'Login failed' };

      const authData = {
        email,
        token: data.token,
        loginTime: new Date().toISOString(),
        userType: 'citizen'
      };
      localStorage.setItem(this.CITIZEN_STORAGE_KEY, JSON.stringify(authData));
      console.log('Citizen login successful, user data stored');
      return { success: true, user: authData };
    } catch (err) {
      console.error('Citizen login error:', err);
      return { success: false, error: 'Network or server error during citizen login' };
    }
  }

  // ---------- ADMIN SIGNUP ----------
  static async signupAdmin(userData) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email.toLowerCase(),
          password: userData.password
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'Registration failed' };

      return { success: true, message: data.message || 'Admin registered successfully' };
    } catch (err) {
      return { success: false, error: 'Network or server error during admin signup' };
    }
  }

  // ---------- ADMIN LOGIN ----------
  static async loginAdmin(email, password) {
    try {
      console.log('Attempting admin login with:', email);
      const res = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      });

      const data = await res.json();
      console.log('Admin login response:', data);
      if (!res.ok) return { success: false, error: data.message || 'Login failed' };

      const authData = {
        email,
        token: data.token,
        loginTime: new Date().toISOString(),
        userType: 'admin'
      };
      localStorage.setItem(this.ADMIN_STORAGE_KEY, JSON.stringify(authData));
      console.log('Admin login successful, user data stored');
      return { success: true, user: authData };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, error: 'Network or server error during admin login' };
    }
  }

  static logout(userType = 'citizen') {
    const key = userType === 'admin' ? this.ADMIN_STORAGE_KEY : this.CITIZEN_STORAGE_KEY;
    localStorage.removeItem(key);
  }

  static isAuthenticated(userType = 'citizen') {
    const key = userType === 'admin' ? this.ADMIN_STORAGE_KEY : this.CITIZEN_STORAGE_KEY;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    const authData = JSON.parse(data);
    
    // Check if token is expired
    if (authData.token && this.isTokenExpired(authData.token)) {
      console.log('Token expired, clearing storage');
      localStorage.removeItem(key);
      return null;
    }
    
    return authData;
  }

  static getCurrentUser(userType = 'citizen') {
    return this.isAuthenticated(userType);
  }
}


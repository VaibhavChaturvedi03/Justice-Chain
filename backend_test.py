import requests
import sys
from datetime import datetime

class JusticeChainAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"Response: {response.json()}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")

            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_citizen_login(self, email, password):
        """Test citizen login"""
        return self.run_test(
            "Citizen Login",
            "POST",
            "api/auth/citizen/login",
            200,
            data={"email": email, "password": password}
        )

    def test_admin_login(self, email, password):
        """Test admin login"""
        return self.run_test(
            "Admin Login",
            "POST",
            "api/auth/admin/login",
            200,
            data={"email": email, "password": password}
        )

def main():
    # Setup
    tester = JusticeChainAPITester("http://localhost:5000")
    
    # Test citizen login with demo credentials
    print("\n===== Testing Citizen Login =====")
    citizen_success, _ = tester.test_citizen_login("user@example.com", "password123")
    
    # Test admin login with demo credentials
    print("\n===== Testing Admin Login =====")
    admin_success, _ = tester.test_admin_login("admin@justice.gov.in", "admin123")
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if citizen_success and admin_success:
        print("✅ Backend authentication endpoints are working correctly")
    else:
        print("❌ Some authentication tests failed")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
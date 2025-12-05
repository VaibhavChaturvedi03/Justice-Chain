

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const pinataSDK = require('pinata');

async function testPinataConnection() {
  console.log('🔍 Pinata Configuration Test\n');

  // Check environment variables
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_API_KEY;

  console.log('1️⃣  Checking environment variables...');
  if (!apiKey) {
    console.error('❌ PINATA_API_KEY not found in .env');
    process.exit(1);
  } else {
    console.log('✓ PINATA_API_KEY found');
  }

  if (!secretKey) {
    console.error('❌ PINATA_SECRET_API_KEY not found in .env');
    process.exit(1);
  } else {
    console.log('✓ PINATA_SECRET_API_KEY found\n');
  }

  // Initialize Pinata client
  console.log('2️⃣  Initializing Pinata SDK...');
  try {
    const pinata = new pinataSDK(apiKey, secretKey);
    console.log('✓ Pinata SDK initialized\n');

    // Test authentication
    console.log('3️⃣  Testing Pinata authentication...');
    const testResult = await pinata.testAuthentication();
    if (testResult) {
      console.log('✓ Pinata authentication successful');
      console.log(`  API Key: ${apiKey.substring(0, 10)}...`);
      console.log(`  Secret Key: ${secretKey.substring(0, 10)}...\n`);
    } else {
      console.error('❌ Pinata authentication failed');
      process.exit(1);
    }

    // Test file upload
    console.log('4️⃣  Testing file upload...');
    const testBuffer = Buffer.from('This is a test file for Pinata upload');
    const testFileName = `test_${Date.now()}.txt`;

    const tempDir = require('os').tmpdir();
    const tempFilePath = path.join(tempDir, testFileName);
    fs.writeFileSync(tempFilePath, testBuffer);

    const fileStream = fs.createReadStream(tempFilePath);

    const options = {
      pinataMetadata: {
        name: testFileName,
        keyvalues: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      }
    };

    const uploadResult = await pinata.pinFileToIPFS(fileStream, options);

    // Clean up
    fs.unlinkSync(tempFilePath);

    if (uploadResult && uploadResult.IpfsHash) {
      console.log('✓ File upload successful!');
      console.log(`  IPFS Hash: ${uploadResult.IpfsHash}`);
      console.log(`  Pinata URL: https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`);
      console.log(`  Timestamp: ${uploadResult.Timestamp}\n`);

      // Test gateway access
      console.log('5️⃣  Testing Pinata gateway access...');
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`;
      
      try {
        const fetch = require('node-fetch');
        const response = await fetch(gatewayUrl, { timeout: 5000 });
        if (response.ok) {
          console.log('✓ Gateway access successful');
          console.log(`  Status: ${response.status}`);
          console.log(`  Content-Length: ${response.headers.get('content-length')} bytes\n`);
        } else {
          console.warn(`⚠️  Gateway returned status: ${response.status}`);
        }
      } catch (gatewayError) {
        console.warn('⚠️  Could not access gateway (network issue, but Pinata is working)');
        console.log(`  Error: ${gatewayError.message}\n`);
      }

      console.log('✅ All Pinata tests passed!');
      console.log('\nYour Pinata configuration is working correctly.');
      console.log('Photo and video uploads should now work.\n');
      process.exit(0);
    } else {
      console.error('❌ File upload failed - no IPFS hash returned');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during Pinata test:');
    console.error(`  ${error.message}`);
    console.error('\nCommon issues:');
    console.error('  1. API keys are incorrect or expired');
    console.error('  2. Pinata account is not active');
    console.error('  3. Network connection issue');
    console.error('  4. Node version too old (requires Node 14+)\n');
    process.exit(1);
  }
}

testPinataConnection();

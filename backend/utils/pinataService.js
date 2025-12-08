const axios = require('axios');
const FormData = require('form-data');

const PINATA_API_URL = 'https://api.pinata.cloud';

const getPinataHeaders = () => {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API keys not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env file');
  }

  return {
    'pinata_api_key': pinataApiKey,
    'pinata_secret_api_key': pinataSecretApiKey
  };
};

const uploadFileToPinata = async (fileBuffer, fileName, mediaType = 'document') => {
  try {
    console.log('\n=== FIR File Upload to Pinata ===' );
    console.log('File Name:', fileName);
    console.log('File Size:', fileBuffer.length, 'bytes');
    console.log('Media Type:', mediaType);
    console.log('Timestamp:', new Date().toISOString());
    
    const form = new FormData();
    form.append('file', fileBuffer, fileName);

    const metadata = {
      name: fileName,
      keyvalues: {
        uploadedFrom: 'JusticeChain',
        mediaType: mediaType,
        timestamp: new Date().toISOString(),
      }
    };

    form.append('pinataMetadata', JSON.stringify(metadata));

    const headers = getPinataHeaders();

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, form, {
      headers: {
        ...headers,
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      fileName: fileName,
      size: fileBuffer.length,
      timestamp: new Date().toISOString(),
      pinataUrl: pinataUrl,
      mediaType: mediaType
    };
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

const uploadJSONToPinata = async (jsonData, fileName) => {
  try {
    console.log('\n=== FIR JSON Data Upload to Pinata ===' );
    console.log('File Name:', fileName);
    console.log('Data Type: FIR');
    console.log('Timestamp:', new Date().toISOString());
    console.log('FIR Data:', JSON.stringify(jsonData, null, 2));
    
    const metadata = {
      name: fileName,
      keyvalues: {
        uploadedFrom: 'JusticeChain',
        dataType: 'FIR',
        timestamp: new Date().toISOString(),
      }
    };

    const headers = getPinataHeaders();

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, 
      {
        pinataContent: jsonData,
        pinataMetadata: metadata
      },
      {
        headers
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      fileName: fileName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Pinata JSON upload error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

const getFileFromPinata = async (ipfsHash) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    return {
      success: true,
      url: url,
      data: response.data,
      contentType: response.headers['content-type']
    };
  } catch (error) {
    console.error('Pinata fetch error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

const unpinFromPinata = async (ipfsHash) => {
  try {
    const headers = getPinataHeaders();
    
    await axios.delete(`${PINATA_API_URL}/pinning/unpin/${ipfsHash}`, {
      headers
    });
    
    return {
      success: true,
      message: 'File unpinned successfully',
      ipfsHash: ipfsHash
    };
  } catch (error) {
    console.error('Pinata unpin error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

const listPinnedFiles = async (filters = {}) => {
  try {
    const headers = getPinataHeaders();
    
    let queryParams = `pageLimit=${filters.pageLimit || 10}&pageOffset=${filters.pageOffset || 0}`;
    
    const response = await axios.get(
      `${PINATA_API_URL}/data/pinList?${queryParams}`,
      { headers }
    );
    
    return {
      success: true,
      files: response.data.rows,
      count: response.data.count
    };
  } catch (error) {
    console.error('Pinata list error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

const uploadMultipleFilesToPinata = async (fileArray) => {
  const uploadedFiles = [];
  const failedFiles = [];
  
  for (const file of fileArray) {
    const result = await uploadFileToPinata(file.buffer, file.originalname, file.mimetype);
    
    if (result.success) {
      uploadedFiles.push({
        fileName: file.originalname,
        ipfsHash: result.ipfsHash,
        url: result.pinataUrl,
        size: result.size
      });
    } else {
      failedFiles.push({
        fileName: file.originalname,
        error: result.error
      });
    }
  }
  
  const totalUploaded = uploadedFiles.length;
  const totalFailed = failedFiles.length;

  return {
    success: totalFailed === 0,
    uploadedFiles,
    failedFiles,
    message: `${totalUploaded} file(s) uploaded successfully`,
    warning: totalFailed > 0 ? `${totalFailed} file(s) failed to upload` : ''
  };
};

module.exports = {
  uploadFileToPinata,
  uploadJSONToPinata,
  uploadMultipleFilesToPinata,
  getFileFromPinata,
  unpinFromPinata,
  listPinnedFiles
};

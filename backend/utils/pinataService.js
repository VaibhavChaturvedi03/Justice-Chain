const pinataSDK = require('pinata');

const initPinataClient = () => {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API keys not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env file');
  }

  return new pinataSDK(pinataApiKey, pinataSecretApiKey);
};

const uploadFileToPinata = async (fileBuffer, fileName, mediaType = 'document') => {
  try {
    const pinata = initPinataClient();

    const stream = require('stream');
    const readableStream = stream.Readable.from(fileBuffer);

    const options = {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          uploadedFrom: 'JusticeChain',
          mediaType: mediaType, 
          timestamp: new Date().toISOString(),
        }
      }
    };

    const result = await pinata.pinFileToIPFS(readableStream, options);
    
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
    return {
      success: true,
      ipfsHash: result.IpfsHash,
      fileName: fileName,
      size: fileBuffer.length,
      timestamp: new Date().toISOString(),
      pinataUrl: pinataUrl,
      mediaType: mediaType
    };
  } catch (error) {
    console.error('Pinata upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const uploadJSONToPinata = async (jsonData, fileName) => {
  try {
    const pinata = initPinataClient();

    const options = {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          uploadedFrom: 'JusticeChain',
          dataType: 'FIR',
          timestamp: new Date().toISOString(),
        }
      }
    };

    const result = await pinata.pinJSONToIPFS(jsonData, options);
    
    return {
      success: true,
      ipfsHash: result.IpfsHash,
      fileName: fileName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const getFileFromPinata = async (ipfsHash) => {
  try {
    const pinata = initPinataClient();
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    return {
      success: true,
      url: url,
      ipfsHash: ipfsHash
    };
  } catch (error) {
    console.error('Pinata retrieval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const unpinFromPinata = async (ipfsHash) => {
  try {
    const pinata = initPinataClient();
    await pinata.unpin(ipfsHash);
    
    return {
      success: true,
      message: 'File unpinned successfully',
      ipfsHash: ipfsHash
    };
  } catch (error) {
    console.error('Pinata unpin error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const listPinnedFiles = async (filters = {}) => {
  try {
    const pinata = initPinataClient();
    
    const options = {
      pageLimit: filters.pageLimit || 10,
      pageOffset: filters.pageOffset || 0
    };

    if (filters.metadata) {
      options.metadata = filters.metadata;
    }

    const result = await pinata.pinList(options);
    
    return {
      success: true,
      files: result.rows,
      count: result.count
    };
  } catch (error) {
    console.error('Pinata list error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const uploadMultipleFilesToPinata = async (fileArray) => {
  try {
    const results = [];
    
    for (const file of fileArray) {
      const result = await uploadFileToPinata(file.buffer, file.originalName, file.mediaType);
      results.push(result);
    }
    
    return {
      success: true,
      files: results,
      totalSuccessful: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Batch upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  initPinataClient,
  uploadFileToPinata,
  uploadJSONToPinata,
  uploadMultipleFilesToPinata,
  getFileFromPinata,
  unpinFromPinata,
  listPinnedFiles
};

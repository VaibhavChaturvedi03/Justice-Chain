require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

const PINATA_API_KEY = process.env.PINATA_API_KEY || '43871aeceb6a6714608f';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || 'd4f0e5c82eae348ed4c4cd416a13a16b4c5ee7fbeaaecdeefa7d8f8e972280da';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'e425cf9d9200b5ed94e7abae0aefdbe805ac43c95c32576d1236ba915a9e3498';
const RPC_URL = process.env.RPC_URL || 'https://sepolia.infura.io/v3/542f1eaa832d48f7b99c34caca33add7';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x012bE34679a1b49b67926e62D54E6073dEd59cB2';
const PORT = process.env.PORT || 3000;

let abi = [];
try {
    abi = JSON.parse(fs.readFileSync('./JusticeChainABI.json', 'utf8'));
} catch (e) {
    console.warn('JusticeChainABI.json not found or invalid - blockchain features will be disabled until ABI is provided.');
}

const COMPLAINT_CONTRACT_ADDRESS = process.env.COMPLAINT_CONTRACT_ADDRESS || '0xe7e1B7d34F9397059c388aF75138C29Ff42Bf6Fd';
let complaintAbi = [];
try {
    complaintAbi = JSON.parse(fs.readFileSync('./ComplaintABI.json', 'utf8'));
} catch (e) {
    console.warn('ComplaintABI.json not found or invalid - complaint features will be disabled until ABI is provided.');
}

let provider = null;
let wallet = null;
let contract = null;
let complaintContract = null;

// Initialize provider / wallet / contracts with defensive error handling so the server can still start
try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    if (CONTRACT_ADDRESS && abi && abi.length > 0) {
        contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        console.log('JusticeChain contract initialized at', CONTRACT_ADDRESS);
    } else {
        console.warn('JusticeChain contract not initialized (ABI or address missing).');
    }

    if (COMPLAINT_CONTRACT_ADDRESS && complaintAbi && complaintAbi.length > 0) {
        complaintContract = new ethers.Contract(COMPLAINT_CONTRACT_ADDRESS, complaintAbi, wallet);
        console.log('Complaint contract initialized at', COMPLAINT_CONTRACT_ADDRESS);
    } else {
        console.log('Complaint contract not initialized (ABI or address missing).');
    }
} catch (initErr) {
    console.error('Error initializing blockchain provider/wallet/contracts:', initErr && initErr.message ? initErr.message : initErr);
    // Keep contract variables null and allow the HTTP server to start so health checks and actionable errors work.
}

app.get('/', (req, res) => {
    res.send('JusticeChain Backend Running');
});

app.post('/api/uploadFIR', async (req, res) => {
    try {
        console.log('Received FIR Data:', req.body);

        const firData = req.body;

        let severity = 3;
        try{
            const airesponse = await axios.post('http://localhost:5050/classify',
                {description : firData.incidentDescription || ''}
            )

            const priority = airesponse.data.priority.toLowerCase();

            if(priority === "high") {
                severity = 3;
            }
            else if(priority === 'medium') {
                severity = 2;
            }
            else severity = 1; 
        } catch(AIerror){
            console.warn("classification failed , setting severity to 1");
            severity = 1;
        }

        const pinataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

        let ipfsHash = null;
        try {
            const pinataResponse = await axios.post(pinataUrl, {...firData , severity}, {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
                timeout: 10000 // 10 second timeout
            });
            ipfsHash = pinataResponse.data.IpfsHash;
            console.log('Pinata upload successful:', ipfsHash);
        } catch(pinataErr) {
            console.warn("Pinata upload failed:", pinataErr.message);
            // Use the existing IPFS hash from the FIR if available
            ipfsHash = firData.ipfsHash || 'ipfs_pending_' + Date.now();
        }

        const incidentDetailsJson = JSON.stringify(firData.incidentDetailsJson || firData || {});

        const tx = await contract.createFIR(
            firData.incidentType || firData.title || 'Untitled FIR',
            firData.incidentDescription || firData.description || 'No description',
            severity,
            ipfsHash,
            incidentDetailsJson
        );
        console.log("Sending to blockchain:", { severity, firData });

        await tx.wait();
        console.log('Transaction mined');

        res.json({
            success: true,
            message: 'FIR successfully uploaded and saved on blockchain',
            ipfsHash,
            txHash: tx.hash,
        });

    } catch (error) {
        console.error('Error uploading FIR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error uploading FIR',
            error: error.message,
        });
    }
});

    app.post('/api/fileComplaint', async (req, res) => {
        try {
            if (!complaintContract) {
                return res.status(500).json({ success: false, error: 'Complaint contract not configured' });
            }

            const data = req.body || {};

            const incidentType = data.incidentType || data.incidentType || '';
            const incidentDate = data.incidentDate || '';
            const incidentTime = data.incidentTime || '';
            const incidentLocation = data.incidentLocation || data.location || '';
            const incidentDescription = data.incidentDescription || data.description || '';
            const suspectDetails = data.suspectDetails || data.suspectDetails || '';
            const witnessDetails = data.witnessDetails || data.witnessDetails || '';
            const evidenceDescription = data.evidenceDescription || data.evidenceDescription || '';

            const tx = await complaintContract.fileComplaint(
                incidentType,
                incidentDate,
                incidentTime,
                incidentLocation,
                incidentDescription,
                suspectDetails,
                witnessDetails,
                evidenceDescription
            );

            await tx.wait();

            return res.json({ success: true, message: 'Complaint filed on chain', txHash: tx.hash });
        } catch (err) {
            console.error('Error filing complaint on chain:', err);
            return res.status(500).json({ success: false, error: err.message || err.toString() });
        }
    });

app.listen(PORT, () => {
    console.log(`JusticeChain Backend running on port ${PORT}`);
});

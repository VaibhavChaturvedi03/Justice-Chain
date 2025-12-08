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
    res.json({ success: true, message: 'JusticeChain Backend Running' });
});

// Health check endpoint: returns server + provider status
app.get('/health', async (req, res) => {
    const status = { server: true, port: PORT, provider: null, contractLoaded: !!contract, complaintContractLoaded: !!complaintContract };
    if (provider) {
        try {
            // quick provider check
            const block = await provider.getBlockNumber();
            status.provider = { ok: true, latestBlock: block };
        } catch (provErr) {
            status.provider = { ok: false, error: provErr && provErr.message ? provErr.message : String(provErr) };
        }
    } else {
        status.provider = { ok: false, error: 'No provider configured' };
    }

    return res.json({ success: true, status });
});

app.post('/api/uploadFIR', async (req, res) => {
    try {
        console.log('Received FIR Data:', req.body);

        const firData = req.body || {};

        let severity = 3;
        try {
            const airesponse = await axios.post('http://localhost:5050/classify', { description: firData.incidentDescription || '' });
            const priority = (airesponse.data && airesponse.data.priority || '').toString().toLowerCase();
            if (priority === 'high') severity = 3;
            else if (priority === 'medium') severity = 2;
            else severity = 1;
        } catch (AIerror) {
            console.warn('classification failed, setting severity to 1');
            severity = 1;
        }

        const pinataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

        let ipfsHash = null;
        try {
            const pinataResponse = await axios.post(pinataUrl, { ...firData, severity }, {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
                timeout: 10000,
            });
            ipfsHash = pinataResponse.data && pinataResponse.data.IpfsHash;
            console.log('Pinata upload successful:', ipfsHash);
        } catch (pinataErr) {
            console.warn('Pinata upload failed:', pinataErr && pinataErr.message ? pinataErr.message : pinataErr);
            ipfsHash = firData.ipfsHash || 'ipfs_pending_' + Date.now();
        }

        if (!complaintContract) {
            return res.status(500).json({ success: false, error: 'Complaint contract not configured' });
        }

        const incidentDetailsJson = JSON.stringify(firData.incidentDetailsJson || firData || {});

        const tx = await complaintContract.fileComplaint(
            firData.incidentType || firData.title || 'Untitled FIR',
            firData.incidentDate || new Date().toISOString().split('T')[0],
            firData.incidentTime || new Date().toTimeString().split(' ')[0],
            firData.incidentLocation || firData.location || 'Location not specified',
            firData.incidentDescription || firData.description || 'No description',
            firData.suspectDetails || 'No suspect details',
            firData.witnessDetails || 'No witness details',
            firData.evidenceDescription || 'No evidence description'
        );
        console.log("Sending to blockchain:", { firData, ipfsHash });

        const citizenAddress = firData.citizenAddress || firData.walletAddress || firData.toAddress;
        if (!citizenAddress) {
            return res.status(400).json({ success: false, message: 'Error uploading FIR', error: 'citizen wallet address required in payload (citizenAddress)' });
        }

        const metadataUri = `ipfs://${ipfsHash}`;

        console.log('Preparing to send FIR to blockchain (mint or legacy create)...');
        // Prefer mintFir if present in ABI
        try {
            if (contract && typeof contract.mintFir === 'function') {
                console.log('Using contract.mintFir');
                const tx = await contract.mintFir(
                    citizenAddress,
                    firData.incidentType || firData.title || 'Untitled FIR',
                    firData.incidentDescription || firData.description || 'No description',
                    severity,
                    ipfsHash,
                    metadataUri
                );

                console.log('Sending to blockchain (mint)...');
                const receipt = await tx.wait();
                console.log('Mint transaction mined', receipt.transactionHash);

                let tokenId = null;
                try {
                    for (const log of receipt.logs) {
                        try {
                            const parsed = contract.interface.parseLog(log);
                            if (parsed && parsed.name === 'FIRCreated') {
                                tokenId = parsed.args && (parsed.args.id || parsed.args[0]);
                                break;
                            }
                        } catch (e) {
                            // ignore parse errors
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse FIRCreated event for tokenId:', e && e.message ? e.message : e);
                }

                return res.json({ success: true, message: 'FIR minted as NFT on blockchain', ipfsHash, txHash: receipt.transactionHash, tokenId: tokenId !== null ? tokenId.toString() : null });
            }

            // Fallback to legacy createFIR if present (older contract ABI)
            if (contract && typeof contract.createFIR === 'function') {
                console.log('Using contract.createFIR (legacy)');
                const tx = await contract.createFIR(
                    firData.incidentType || firData.title || 'Untitled FIR',
                    firData.incidentDescription || firData.description || 'No description',
                    severity,
                    ipfsHash,
                    incidentDetailsJson
                );

                console.log('Sending to blockchain (legacy createFIR)...');
                const receipt = await tx.wait();
                console.log('Legacy transaction mined', receipt.transactionHash);

                return res.json({ success: true, message: 'FIR uploaded to blockchain (legacy contract)', ipfsHash, txHash: receipt.transactionHash });
            }

            return res.status(500).json({ success: false, message: 'Error uploading FIR', error: 'Contract ABI does not contain mintFir or createFIR methods' });
        } catch (chainErr) {
            console.error('Error sending FIR to chain:', chainErr && chainErr.message ? chainErr.message : chainErr);
            return res.status(500).json({ success: false, message: 'Error uploading FIR', error: chainErr && chainErr.message ? chainErr.message : String(chainErr) });
        }
    } catch (error) {
        console.error('Error uploading FIR:', error && error.message ? error.message : error);
        return res.status(500).json({ success: false, message: 'Error uploading FIR', error: error && error.message ? error.message : String(error) });
    }
});

    app.post('/api/fileComplaint', async (req, res) => {
        try {
            if (!complaintContract) {
                return res.status(500).json({ success: false, error: 'Complaint contract not configured' });
            }

            const data = req.body || {};

            const incidentType = data.incidentType || '';
            const incidentDate = data.incidentDate || '';
            const incidentTime = data.incidentTime || '';
            const incidentLocation = data.incidentLocation || data.location || '';
            const incidentDescription = data.incidentDescription || data.description || '';
            const suspectDetails = data.suspectDetails || '';
            const witnessDetails = data.witnessDetails || '';
            const evidenceDescription = data.evidenceDescription || '';

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
            console.error('Error filing complaint on chain:', err && err.message ? err.message : err);
            return res.status(500).json({ success: false, error: err && err.message ? err.message : String(err) });
        }
    });

    // Close (burn) an existing FIR NFT by tokenId (only backend wallet/police allowed)
    app.post('/api/closeFIR', async (req, res) => {
        try {
            const { tokenId } = req.body || {};
            if (!tokenId) return res.status(400).json({ success: false, error: 'tokenId required' });

            if (!contract) {
                return res.status(500).json({ success: false, error: 'JusticeChain contract not configured on backend' });
            }

            console.log('Closing FIR tokenId:', tokenId);
            const tx = await contract.closeFir(tokenId);
            const receipt = await tx.wait();
            console.log('closeFir tx mined:', receipt.transactionHash);

            return res.json({ success: true, message: 'FIR closed (burned)', txHash: receipt.transactionHash });
        } catch (err) {
            console.error('Error closing FIR on chain:', err && err.message ? err.message : err);
            return res.status(500).json({ success: false, error: err && err.message ? err.message : String(err) });
        }
    });

app.listen(PORT, () => {
    console.log(`JusticeChain Backend running on port ${PORT}`);
});

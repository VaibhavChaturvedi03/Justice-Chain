require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

const PINATA_API_KEY = 'cc8fe42e71e224398f99';
const PINATA_SECRET_API_KEY = 'af5c1aec92580ed58c924a2b7fa4c8cb4688c463071e35359510115e4394c210';
const PRIVATE_KEY = 'a3a711b3ce1f86a929dcc4ed6412ba8b9631edeb261309e97d3fcbfcad35a0f5';
const RPC_URL = 'https://sepolia.infura.io/v3/542f1eaa832d48f7b99c34caca33add7';
const CONTRACT_ADDRESS = '0xF23133f1cd75C8AF6dEe73389BbB4C327697B82D';
const PORT = 4000;

const abi = JSON.parse(fs.readFileSync('./JusticeChainABI.json', 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

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
        }

        const pinataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

        const pinataResponse = await axios.post(pinataUrl, {...firData , severity}, {
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });

        const ipfsHash = pinataResponse.data.IpfsHash;
        

        const tx = await contract.createFIR(
            firData.incidentType || firData.title || 'Untitled FIR',
            firData.incidentDescription || firData.description || 'No description',
            severity,
            ipfsHash
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

app.listen(PORT, () => {
    console.log(`JusticeChain Backend running on port ${PORT}`);
});

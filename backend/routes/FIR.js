const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { NFTStorage, File } = require('nft.storage');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });

router.post('/uploadFIR', upload.single('firFile'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath);

        const metadata = await client.store({
            name: 'FIR Report',
            description: 'Uploaded FIR Report',
            image: new File([fileData], req.file.originalname, { type: 'application/pdf' })
        });

        const ipfsUrl = `https://ipfs.io/ipfs/${metadata.ipnft}`;
        console.log('Uploaded to IPFS:', ipfsUrl);

        res.json({ success: true, ipfsUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload FIR' });
    }
});

module.exports = router;

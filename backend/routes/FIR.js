const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const { verifyToken, isCitizen, isAdmin } = require('../middleware/auth');
const { uploadFileToPinata, uploadJSONToPinata, uploadMultipleFilesToPinata, getFileFromPinata } = require('../utils/pinataService');
const Admin = require('../models/admin');

dotenv.config();

const router = express.Router();
const FIR = require('../models/fir');

function generateFIRNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FIR${year}${random}${timestamp.toString().slice(-6)}`;
}

const pdfDir = path.join(__dirname, '..', 'fir_pdfs');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

router.post('/uploadFIR', verifyToken, isCitizen, async (req, res) => {
    try {
        const data = req.body;
        const firNumber = generateFIRNumber();

        const firData = {
            firNumber,
            ...data,
            timeline: [
                {
                    date: new Date().toISOString().split('T')[0],
                    status: 'FIR Registered',
                    description: 'FIR registered successfully in the system',
                    officer: 'System Administrator'
                }
            ]
        };

        const newFIR = new FIR(firData);
        let savedFIR = await newFIR.save();

        try {
            const pinataMetadata = {
                firNumber: savedFIR.firNumber,
                fullName: savedFIR.fullName,
                email: savedFIR.email,
                phone: savedFIR.phone,
                incidentType: savedFIR.incidentType,
                incidentDate: savedFIR.incidentDate,
                incidentLocation: savedFIR.incidentLocation,
                status: savedFIR.status,
                filedDate: savedFIR.filedDate,
                mongoDBId: savedFIR._id.toString()
            };

            const pinataResult = await uploadJSONToPinata(
                pinataMetadata,
                `fir_${savedFIR.firNumber}.json`
            );

            if (pinataResult.success) {
                savedFIR.ipfsHash = pinataResult.ipfsHash;
                savedFIR.ipfsMetadata = {
                    uploadedAt: new Date(),
                    fileName: `fir_${savedFIR.firNumber}.json`,
                    contentType: 'application/json'
                };
            }
        } catch (pinataError) {
            console.error('Pinata upload error (non-blocking):', pinataError.message);
        }

        const pdfPath = path.join(pdfDir, `fir_${savedFIR._id}.pdf`);
        const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        const nowDate = new Date().toISOString().split('T')[0];
        const filedDate = savedFIR.filedDate || nowDate;

        doc.fontSize(12).font('Helvetica-Bold').text('Government of India / State Police Department', { align: 'center' });
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica').text('[Police Station Name / Jurisdiction]', { align: 'center' });
        doc.moveDown(0.6);
        doc.fontSize(16).font('Helvetica-Bold').text('FIRST INFORMATION REPORT (FIR)', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica-Oblique').text('Generated via JusticeChain System', { align: 'center' });
        doc.moveDown();

        doc.moveDown(0.2);
        const leftX = doc.page.margins.left;
        const midX = leftX + 260;
        doc.fontSize(12).font('Helvetica-Bold').text('2. FIR Metadata', leftX, doc.y);
        doc.moveDown(0.2);

        function ensureSpace(lines = 1) {
            const lineHeight = 14 * lines;
            if (doc.y + lineHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
        }

        function twoCol(key, value) {
            ensureSpace(2);
            const y = doc.y;
            doc.font('Helvetica-Bold').fontSize(10).text(key, leftX, y);
            doc.font('Helvetica').fontSize(10).text(value || '-', midX, y);
            doc.moveDown(1.6);
        }

        const rightX = midX + 10;
        const rightWidth = doc.page.width - doc.page.margins.right - rightX;

        twoCol('FIR ID', savedFIR._id.toString());
        twoCol('FIR Number', savedFIR.firNumber || '-');
        twoCol('Date & Time of Filing', filedDate);
        twoCol('IPFS Hash', savedFIR.ipfsHash || 'Pending');
        twoCol('Severity Score', savedFIR.severity != null ? savedFIR.severity : 'N/A');

        doc.fontSize(12).font('Helvetica-Bold').text('3. Complainant / Personal Information', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            `Full Name: ${savedFIR.fullName || '-'}`,
            `Father's Name: ${savedFIR.fatherName || '-'}`,
            `Gender: ${savedFIR.gender || '-'}`,
            `Age: ${savedFIR.age || '-'}`,
            `Occupation: ${savedFIR.occupation || '-'}`,
            `Phone Number: ${savedFIR.phone || '-'}`,
            `Email Address: ${savedFIR.email || '-'}`,
            `Address: ${savedFIR.address || '-'}`,
            `City: ${savedFIR.city || '-'}`,
            `State: ${savedFIR.state || '-'}`,
            `Pincode: ${savedFIR.pincode || '-'}`,
            `ID Type: ${savedFIR.idType || '-'}`,
            `ID Number: ${savedFIR.idNumber || '-'}`
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.4);

        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('4. Incident Details', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            `Type of Incident: ${savedFIR.incidentType || '-'}`,
            `Date of Incident: ${savedFIR.incidentDate || '-'}`,
            `Time of Incident: ${savedFIR.incidentTime || '-'}`,
            `Location of Incident: ${savedFIR.incidentLocation || '-'}`
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text('Incident Description:');
        doc.moveDown(0.1);
        doc.fontSize(11).font('Helvetica').text(savedFIR.incidentDescription || '-', { align: 'left' });

        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('5. Additional Case Information');
        doc.moveDown(0.2);
        if (savedFIR.suspectDetails) {
            doc.fontSize(11).font('Helvetica-Bold').text('Suspect Details (if provided):');
            doc.fontSize(11).font('Helvetica').text(savedFIR.suspectDetails || '-');
            doc.moveDown(0.2);
        }
        if (savedFIR.witnessDetails) {
            doc.fontSize(11).font('Helvetica-Bold').text('Witness Details (if any):');
            doc.fontSize(11).font('Helvetica').text(savedFIR.witnessDetails || '-');
            doc.moveDown(0.2);
        }
        if (savedFIR.evidenceDescription) {
            doc.fontSize(11).font('Helvetica-Bold').text('Evidence Description:');
            doc.fontSize(11).font('Helvetica').text(savedFIR.evidenceDescription || '-');
            doc.moveDown(0.2);
        }

        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('6. Case Status');
        doc.moveDown(0.2);
        twoCol('Current Status', savedFIR.status || 'FIR Registered');
        twoCol('Urgency Level', savedFIR.urgencyLevel || 'N/A');

        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica-Oblique').text('This FIR is stored securely on decentralized IPFS and MongoDB. All data is encrypted and immutable.');

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        savedFIR.pdfPath = `/api/downloadFIR/${savedFIR._id}`;
        await savedFIR.save();

        return res.json({ success: true, fir: savedFIR });
    } catch (err) {
        console.error('Error saving FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Public search endpoint - no authentication required
router.post('/publicSearch', async (req, res) => {
    try {
        const { searchType, searchValue } = req.body;

        if (!searchType || !searchValue) {
            return res.status(400).json({ success: false, error: 'Search type and value required' });
        }

        let query = {};

        switch (searchType.toLowerCase()) {
            case 'fir':
                query = { firNumber: searchValue };
                break;
            case 'phone':
                query = { phone: searchValue };
                break;
            case 'email':
                query = { email: new RegExp(searchValue, 'i') };
                break;
            case 'id':
                query = { idNumber: searchValue };
                break;
            case 'name':
                query = { fullName: new RegExp(searchValue, 'i') };
                break;
            case 'incident':
                query = { incidentType: searchValue };
                break;
            case 'status':
                query = { status: searchValue };
                break;
            case 'location':
                query = { incidentLocation: new RegExp(searchValue, 'i') };
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid search type' });
        }

        // Exclude personal data from public search results
        const results = await FIR.find(query)
            .select('-mediaFilesIPFS -email -phone -address -city -state -pincode -fatherName -age -gender -occupation -idType -idNumber -suspectDetails -witnessDetails -evidenceDescription -previousComplaint -previousComplaintDetails')
            .lean();

        return res.json({
            success: true,
            count: results.length,
            results: results
        });
    } catch (err) {
        console.error('Error searching FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/searchFIR', verifyToken, async (req, res) => {
    try {
        const { searchType, searchValue } = req.body;

        if (!searchType || !searchValue) {
            return res.status(400).json({ success: false, error: 'Search type and value required' });
        }

        let query = {};

        switch (searchType.toLowerCase()) {
            case 'fir':
                query = { firNumber: searchValue };
                break;
            case 'phone':
                query = { phone: searchValue };
                break;
            case 'email':
                query = { email: new RegExp(searchValue, 'i') };
                break;
            case 'id':
                query = { idNumber: searchValue };
                break;
            case 'name':
                query = { fullName: new RegExp(searchValue, 'i') };
                break;
            case 'incident':
                query = { incidentType: searchValue };
                break;
            case 'status':
                query = { status: searchValue };
                break;
            case 'location':
                query = { incidentLocation: new RegExp(searchValue, 'i') };
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid search type' });
        }

        const results = await FIR.find(query).select('-mediaFilesIPFS').lean();

        return res.json({
            success: true,
            count: results.length,
            results: results
        });
    } catch (err) {
        console.error('Error searching FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getFIR/:id', verifyToken, async (req, res) => {
    try {
        const fir = await FIR.findById(req.params.id);

        if (!fir) {
            return res.status(404).json({ success: false, error: 'FIR not found' });
        }

        return res.json({ success: true, fir });
    } catch (err) {
        console.error('Error fetching FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getUserFIRs', verifyToken, isCitizen, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const firs = await FIR.find({ email: userEmail }).select('-mediaFilesIPFS').sort({ createdAt: -1 });

        return res.json({ success: true, count: firs.length, firs });
    } catch (err) {
        console.error('Error fetching user FIRs:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Public endpoint for CurrentCases page - no authentication required
router.get('/publicFIRs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await FIR.countDocuments();
        const firs = await FIR.find()
            .select('-mediaFilesIPFS -email -phone -address -city -state -pincode -fatherName -age -gender -occupation -idType -idNumber -suspectDetails -witnessDetails -evidenceDescription -previousComplaint -previousComplaintDetails')  
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.json({
            success: true,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            firs
        });
    } catch (err) {
        console.error('Error fetching public FIRs:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getAllFIRs', verifyToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const admin = await Admin.findOne({ email: req.user.email });
        
        let query = {};
        
        if (admin && admin.state) {
            query = { state: admin.state };
        }

        const total = await FIR.countDocuments(query);
        const firs = await FIR.find(query)
            .select('-mediaFilesIPFS')  
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.json({
            success: true,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            adminState: admin?.state || 'All States',
            firs
        });
    } catch (err) {
        console.error('Error fetching all FIRs:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/updateStatus/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status, description, officer } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        const fir = await FIR.findByIdAndUpdate(
            req.params.id,
            {
                status,
                lastUpdated: new Date().toISOString().split('T')[0],
                $push: {
                    timeline: {
                        date: new Date().toISOString().split('T')[0],
                        status,
                        description: description || '',
                        officer: officer || 'System Administrator'
                    }
                }
            },
            { new: true }
        );

        if (!fir) {
            return res.status(404).json({ success: false, error: 'FIR not found' });
        }

        return res.json({ success: true, fir });
    } catch (err) {
        console.error('Error updating FIR status:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/downloadFIR/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const fir = await FIR.findById(id).lean();
        if (!fir) return res.status(404).json({ success: false, error: 'FIR not found' });

        const pdfFile = path.join(__dirname, '..', 'fir_pdfs', `fir_${fir._id}.pdf`);
        if (!fs.existsSync(pdfFile)) {
            return res.status(404).json({ success: false, error: 'PDF not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fir.firNumber || 'fir'}.pdf"`);

        const fileStream = fs.createReadStream(pdfFile);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Error downloading FIR PDF:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getIPFSFile/:id', async (req, res) => {
    try {
        const fir = await FIR.findById(req.params.id).lean();
        if (!fir || !fir.ipfsHash) {
            return res.status(404).json({ success: false, error: 'IPFS file not found' });
        }

        const pinataResult = await getFileFromPinata(fir.ipfsHash);
        if (!pinataResult.success) {
            return res.status(500).json({ success: false, error: pinataResult.error });
        }

        return res.json({ success: true, url: pinataResult.url, ipfsHash: fir.ipfsHash });
    } catch (err) {
        console.error('Error getting IPFS file:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/uploadMedia/:firId', verifyToken, async (req, res) => {
    try {
        const firId = req.params.firId;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files provided' });
        }

        const fir = await FIR.findById(firId);
        if (!fir) {
            return res.status(404).json({ success: false, error: 'FIR not found' });
        }

        if (req.user.userType === 'citizen' && req.user.email !== fir.email) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const uploadedFiles = [];
        const failedFiles = [];

        for (const file of files) {
            const extension = file.originalname.split('.').pop().toLowerCase();
            let mediaType = 'document';
            
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
                mediaType = 'photo';
            } else if (['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp'].includes(extension)) {
                mediaType = 'video';
            }

            console.log(`Uploading ${file.originalname} (${mediaType}) to Pinata...`);
            const pinataResult = await uploadFileToPinata(file.buffer, file.originalname, mediaType);

            if (pinataResult.success) {
                const mediaFile = {
                    originalName: file.originalname,
                    ipfsHash: pinataResult.ipfsHash,
                    size: file.size,
                    mimeType: file.mimetype,
                    mediaType: mediaType,
                    uploadedAt: new Date(),
                    pinataUrl: pinataResult.pinataUrl
                };

                fir.mediaFilesIPFS.push(mediaFile);
                uploadedFiles.push(mediaFile);
                console.log(`✓ Successfully uploaded: ${file.originalname} (IPFS: ${pinataResult.ipfsHash})`);
            } else {
                failedFiles.push({
                    fileName: file.originalname,
                    error: pinataResult.error
                });
                console.error(`✗ Failed to upload ${file.originalname}: ${pinataResult.error}`);
            }
        }

        await fir.save();

        const response = {
            success: uploadedFiles.length > 0,
            message: `${uploadedFiles.length} file(s) uploaded successfully`,
            uploadedFiles: uploadedFiles,
            failedFiles: failedFiles
        };

        if (failedFiles.length > 0) {
            response.warning = `${failedFiles.length} file(s) failed to upload`;
        }

        return res.json(response);

    } catch (err) {
        console.error('Error uploading media:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getMedia/:firId', async (req, res) => {
    try {
        const fir = await FIR.findById(req.params.firId).select('mediaFilesIPFS');

        if (!fir) {
            return res.status(404).json({ success: false, error: 'FIR not found' });
        }

        return res.json({
            success: true,
            mediaFiles: fir.mediaFilesIPFS || [],
            count: (fir.mediaFilesIPFS || []).length
        });

    } catch (err) {
        console.error('Error fetching media:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/getStatistics', verifyToken, isAdmin, async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.user.email });
        
        let query = {};
        if (admin && admin.state) {
            query = { state: admin.state };
        }

        const total = await FIR.countDocuments(query);
        const statuses = await FIR.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusMap = {};
        statuses.forEach(s => {
            statusMap[s._id] = s.count;
        });

        return res.json({
            success: true,
            total,
            adminState: admin?.state || 'All States',
            statuses: statusMap
        });
    } catch (err) {
        console.error('Error getting statistics:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

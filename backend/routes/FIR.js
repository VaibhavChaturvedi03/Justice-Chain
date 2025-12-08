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
const nodemailer = require('nodemailer');
const { getMaxListeners } = require('events');

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
                    status: 'Complaint Registered',
                    description: 'Complaint registered successfully in the system',
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
        twoCol('Current Status', savedFIR.status || 'Complaint Registered');
        twoCol('Urgency Level', savedFIR.urgencyLevel || 'N/A');

        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica-Oblique').text('This FIR is stored securely on decentralized IPFS and MongoDB. All data is encrypted and immutable.');

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        savedFIR.complaintPdfPath = `/api/downloadComplaint/${savedFIR._id}`;
        savedFIR.pdfPath = `/api/downloadFIR/${savedFIR._id}`;
        await savedFIR.save();

        (async () => {
            try {
                const complaintPayload = {
                    incidentType: savedFIR.incidentType,
                    incidentDate: savedFIR.incidentDate,
                    incidentTime: savedFIR.incidentTime,
                    incidentLocation: savedFIR.incidentLocation,
                    incidentDescription: savedFIR.incidentDescription,
                    suspectDetails: savedFIR.suspectDetails || '',
                    witnessDetails: savedFIR.witnessDetails || '',
                    evidenceDescription: savedFIR.evidenceDescription || ''
                };

                const bcRes = await require('axios').post('http://localhost:3000/api/fileComplaint', complaintPayload);
                console.log('Complaint filed on blockchain backend:', bcRes.data);
            } catch (bcErr) {
                console.warn('Failed to file complaint on blockchain:', bcErr?.message || bcErr);
            }
        })();

        return res.json({ success: true, fir: savedFIR });
    } catch (err) {
        console.error('Error saving FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

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
        console.log('getAllFIRs called by admin:', req.user.email, 'adminRecord:', !!admin);
        if (admin) console.log('admin.state=', admin.state);
        
        let query = {};
        
        if (admin && admin.state) {
            query = { state: admin.state };
        }

        const total = await FIR.countDocuments(query);
        console.log(`FIR count for query ${JSON.stringify(query)} => ${total}`);
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

// Download complaint copy (PDF) for a FIR's complaint data
router.get('/downloadComplaint/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const fir = await FIR.findById(id).lean();
        if (!fir) return res.status(404).json({ success: false, error: 'FIR not found' });

        const pdfFile = path.join(__dirname, '..', 'fir_pdfs', `complaint_${fir._id}.pdf`);

        // If PDF file doesn't exist, generate it
        if (!fs.existsSync(pdfFile)) {
            const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });
            const stream = fs.createWriteStream(pdfFile);
            doc.pipe(stream);

            const nowDate = new Date().toISOString().split('T')[0];
            const complaintNumber = `CMP${new Date().getFullYear()}${fir._id.toString().slice(-6)}`;

            doc.fontSize(12).font('Helvetica-Bold').text('Government of India / State Police Department', { align: 'center' });
            doc.moveDown(0.2);
            doc.fontSize(10).font('Helvetica').text('[Police Station Name / Jurisdiction]', { align: 'center' });
            doc.moveDown(0.6);
            doc.fontSize(16).font('Helvetica-Bold').text('COMPLAINT REGISTRATION FORM', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(9).font('Helvetica-Oblique').text('Generated via JusticeChain System', { align: 'center' });
            doc.moveDown();

            const leftX = doc.page.margins.left;
            const midX = leftX + 260;

            function twoCol(key, value) {
                const y = doc.y;
                doc.font('Helvetica-Bold').fontSize(10).text(key, leftX, y);
                doc.font('Helvetica').fontSize(10).text(value || '-', midX, y);
                doc.moveDown(1.6);
            }

            twoCol('Complaint Number', complaintNumber);
            twoCol('FIR Number (if any)', fir.firNumber || '-');
            twoCol('Date & Time of Filing', fir.filedDate || nowDate);
            twoCol('Complainant Name', fir.fullName || '-');
            twoCol('Phone', fir.phone || '-');
            twoCol('Email', fir.email || '-');
            twoCol('Incident Type', fir.incidentType || '-');
            twoCol('Incident Date', fir.incidentDate || '-');
            twoCol('Incident Time', fir.incidentTime || '-');
            twoCol('Location', fir.incidentLocation || '-');

            doc.moveDown(0.2);
            doc.fontSize(11).font('Helvetica-Bold').text('Incident Description:');
            doc.moveDown(0.1);
            doc.fontSize(11).font('Helvetica').text(fir.incidentDescription || '-', { align: 'left' });

            doc.moveDown(0.5);
            if (fir.suspectDetails) {
                doc.fontSize(11).font('Helvetica-Bold').text('Suspect Details:');
                doc.fontSize(11).font('Helvetica').text(fir.suspectDetails || '-');
                doc.moveDown(0.2);
            }
            if (fir.witnessDetails) {
                doc.fontSize(11).font('Helvetica-Bold').text('Witness Details:');
                doc.fontSize(11).font('Helvetica').text(fir.witnessDetails || '-');
                doc.moveDown(0.2);
            }
            if (fir.evidenceDescription) {
                doc.fontSize(11).font('Helvetica-Bold').text('Evidence Description:');
                doc.fontSize(11).font('Helvetica').text(fir.evidenceDescription || '-');
                doc.moveDown(0.2);
            }

            doc.fontSize(9).font('Helvetica-Oblique').text('This complaint record has been generated for your reference. For official actions, contact your local police station.', { align: 'left' });

            doc.end();

            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="complaint_${fir.firNumber || fir._id}.pdf"`);

        const fileStream = fs.createReadStream(pdfFile);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Error downloading complaint PDF:', err);
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
                    error: pinataResult.error || 'Unknown error'
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

// Notify citizen by email that their FIR was registered on-chain
router.post('/notifyRegistration', verifyToken, isAdmin, async (req, res) => {
    try {
        const { firId, txHash } = req.body;
        if (!firId) return res.status(400).json({ success: false, error: 'firId required' });

        const fir = await FIR.findById(firId);
        if (!fir) return res.status(404).json({ success: false, error: 'FIR not found' });

        const emailTo = fir.email;
        if (!emailTo) return res.status(400).json({ success: false, error: 'No email associated with FIR' });

        // SMTP configuration from environment
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const fromEmail = process.env.FROM_EMAIL || smtpUser;

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.error('Missing SMTP environment variables:', { smtpHost, smtpPort, smtpUser: !!smtpUser });
            return res.status(500).json({ success: false, error: 'SMTP configuration missing in environment' });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            secure: parseInt(smtpPort, 10) === 465,
            auth: { user: smtpUser, pass: smtpPass }
        });

        // Verify SMTP connection before sending
        try {
            await transporter.verify();
            console.log('SMTP transporter verified');
        } catch (verifyErr) {
            console.error('SMTP verification failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
            return res.status(500).json({ success: false, error: 'SMTP verification failed', details: verifyErr && verifyErr.message });
        }

        const trackUrl = `${req.protocol}://${req.get('host')}/track/${fir.firNumber || fir._id}`;
        const subject = 'Your FIR has been registered on JusticeChain';
        const text = `Dear ${fir.fullName || 'Citizen'},\n\nYour FIR has been registered on the blockchain.\n\nFIR Number: ${fir.firNumber || ''}\nTransaction: ${txHash || ''}\nYou can track your FIR at: ${trackUrl}\n\nRegards,\nJusticeChain Team`;

        try {
            const info = await transporter.sendMail({ from: fromEmail, to: emailTo, subject, text });
            console.log('Notification email sent:', info && info.messageId ? info.messageId : info);
            return res.json({ success: true, message: 'Notification sent', info });
        } catch (sendErr) {
            console.error('Error sending notification email:', sendErr && sendErr.message ? sendErr.message : sendErr);
            return res.status(500).json({ success: false, error: 'Failed to send email', details: sendErr && sendErr.message });
        }
    } catch (err) {
        console.error('Error in notifyRegistration handler:', err);
        return res.status(500).json({ success: false, error: err.message || err.toString() });
    }
});

// Admin-only: test email endpoint to validate SMTP settings
router.post('/testEmail', verifyToken, isAdmin, async (req, res) => {
    try {
        const { to, subject, text } = req.body;
        if (!to) return res.status(400).json({ success: false, error: 'to email required' });

        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT || 587;
        const smtpUser = 'vaibhavchaturvedi.work@gmail.com';
        const smtpPass = odxtiwwyjefqalvv;
        const fromEmail = process.env.FROM_EMAIL || smtpUser;

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.error('Missing SMTP env for testEmail:', { smtpHost, smtpPort, smtpUser: !!smtpUser });
            return res.status(500).json({ success: false, error: 'SMTP configuration missing in environment' });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            secure: parseInt(smtpPort, 10) === 465,
            auth: { user: smtpUser, pass: smtpPass }
        });

        await transporter.verify();
        const info = await transporter.sendMail({ from: fromEmail, to, subject: subject || 'JusticeChain Test Email', text: text || 'This is a test email from JusticeChain' });
        return res.json({ success: true, info });
    } catch (err) {
        console.error('Test email failed:', err && err.message ? err.message : err);
        return res.status(500).json({ success: false, error: err && err.message ? err.message : err.toString() });
    }
});

module.exports = router;

// Debug endpoint (admin-only) to inspect FIR counts and admin state quickly
// Note: This is for development only; remove or protect in production.
router.get('/debug/admin-firs', verifyToken, isAdmin, async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.user.email });
        const query = (admin && admin.state) ? { state: admin.state } : {};
        const total = await FIR.countDocuments(query);
        const sample = await FIR.findOne(query).select('-mediaFilesIPFS').lean();
        return res.json({ success: true, adminEmail: req.user.email, adminState: admin?.state || null, query, total, sample });
    } catch (err) {
        console.error('Debug endpoint error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


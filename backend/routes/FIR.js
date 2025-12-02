const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const { verifyToken, isCitizen, isAdmin } = require('../middleware/auth');

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

        const newFIR = new FIR({
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
        });

        const saved = await newFIR.save();

        const pdfPath = path.join(pdfDir, `fir_${saved._id}.pdf`);
        const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        const nowDate = new Date().toISOString().split('T')[0];
        const filedDate = saved.filedDate || nowDate;

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
        const metaStartY = doc.y;

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

        function rightTitle(text) {
            ensureSpace(1);
            doc.font('Helvetica-Bold').fontSize(12).text(text, rightX, doc.y, { width: rightWidth });
            doc.moveDown(0.2);
        }

        function rightList(items) {
            ensureSpace(items.length * 1.2);
            doc.font('Helvetica').fontSize(11);
            for (const it of items) {
                ensureSpace(1);
                doc.text('• ' + it, rightX, doc.y, { width: rightWidth });
                doc.moveDown(0.3);
            }
        }

        twoCol('FIR ID', saved._id.toString());
        twoCol('FIR Number', saved.firNumber || '-');
        twoCol('Date & Time of Filing', filedDate);
        twoCol('IPFS Hash', saved.ipfsHash || 'CID not available');
        twoCol('Blockchain Tx Hash', saved.txHash || 'Tx not available');
        twoCol('Severity Score', saved.severityScore != null ? saved.severityScore : 'N/A');

        doc.fontSize(12).font('Helvetica-Bold').text('3. Complainant / Personal Information', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            `Full Name: ${saved.fullName || '-'}`,
            `Father's Name: ${saved.fatherName || '-'}`,
            `Gender: ${saved.gender || '-'}`,
            `Age: ${saved.age || '-'}`,
            `Occupation: ${saved.occupation || '-'}`,
            `Phone Number: ${saved.phone || '-'}`,
            `Email Address: ${saved.email || '-'}`,
            `Address: ${saved.address || '-'}`,
            `City: ${saved.city || '-'}`,
            `State: ${saved.state || '-'}`,
            `Pincode: ${saved.pincode || '-'}`,
            `ID Type: ${saved.idType || '-'}`,
            `ID Number: ${saved.idNumber || '-'}`
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.4);

        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('4. Incident Details', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            `Type of Incident: ${saved.incidentType || '-'}`,
            `Date of Incident: ${saved.incidentDate || '-'}`,
            `Time of Incident: ${saved.incidentTime || '-'}`,
            `Location of Incident: ${saved.incidentLocation || '-'}`
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text('Incident Description:');
        doc.moveDown(0.1);
        doc.fontSize(11).font('Helvetica').text(saved.incidentDescription || '-', { align: 'left' });

        doc.addPageIfNeeded = function () {
            if (doc.y > doc.page.height - 140) doc.addPage();
        };
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('5. Additional Case Information');
        doc.moveDown(0.2);
        if (saved.suspectDetails) {
            doc.fontSize(11).font('Helvetica-Bold').text('Suspect Details (if provided):');
            doc.fontSize(11).font('Helvetica').text(saved.suspectDetails || '-');
            doc.moveDown(0.2);
        }
        if (saved.witnessDetails) {
            doc.fontSize(11).font('Helvetica-Bold').text('Witness Details (if any):');
            doc.fontSize(11).font('Helvetica').text(saved.witnessDetails || '-');
            doc.moveDown(0.2);
        }
        if (saved.evidenceDescription) {
            doc.fontSize(11).font('Helvetica-Bold').text('Evidence Description:');
            doc.fontSize(11).font('Helvetica').text(saved.evidenceDescription || '-');
            doc.moveDown(0.2);
        }
        if (saved.evidenceFiles && Array.isArray(saved.evidenceFiles) && saved.evidenceFiles.length) {
            doc.fontSize(11).font('Helvetica-Bold').text('Evidence Attachments:', leftX, doc.y);
            doc.fontSize(10).font('Helvetica');
            saved.evidenceFiles.forEach(f => {
                doc.list([`${f.filename || 'file'} - ${f.ipfs || f.cid || 'IPFS CID not available'}`], leftX, doc.y, { bulletRadius: 2 });
            });
            doc.moveDown(0.2);
        }

        doc.moveDown(0.2);
        doc.fontSize(12).font('Helvetica-Bold').text('6. Case Severity Ranking');
        doc.moveDown(0.1);
        doc.fontSize(11).font('Helvetica').text(`Severity Score: ${saved.severityScore != null ? saved.severityScore : 'N/A'} (0-10)`);
        doc.fontSize(11).font('Helvetica').text(`Category: ${saved.severityCategory || 'N/A'}`);
        doc.fontSize(10).font('Helvetica-Oblique').text(`Reason: ${saved.severityReason || 'Auto-classified based on description'}`);

        doc.moveDown(0.4);
        doc.fontSize(12).font('Helvetica-Bold').text('7. Blockchain Verification Section');
        doc.moveDown(0.2);
        twoCol('Smart Contract Name', 'JusticeChain');
        twoCol('Network', process.env.BLOCKCHAIN_NETWORK || 'Ethereum / Polygon / Sepolia Testnet');
        twoCol('Smart Contract Address', saved.contractAddress || (process.env.CONTRACT_ADDRESS || '0x...'));
        twoCol('IPFS Storage', 'FIR + Evidence stored on decentralized IPFS');
        twoCol('Tamper-Proof Guarantee', 'Yes');
        ensureSpace(3);
        doc.fontSize(9).font('Helvetica').text('This FIR has been cryptographically recorded on blockchain. Any modification attempt will result in a new transaction visible to the public, ensuring full transparency.', rightX, doc.y, { width: rightWidth });

        doc.moveDown(0.4);
        const status = (saved.timeline && saved.timeline.length) ? saved.timeline[0].status : 'FIR Filed / Under Review';
        const officer = (saved.timeline && saved.timeline.length) ? saved.timeline[0].officer : 'Pending';
        doc.fontSize(12).font('Helvetica-Bold').text('8. Status & Actions', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            'Initially:',
            `Status: ${status}`,
            `Assigned Officer: ${officer}`,
            'Next Action: Awaiting Police Assignment'
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.4);

        doc.fontSize(12).font('Helvetica-Bold').text('9. Signatures', leftX, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(11).font('Helvetica').list([
            'Since it is digitally generated:',
            'Digitally Signed by: JusticeChain System',
            'No manual signature required',
            'Complainant acknowledgement: Submitted electronically'
        ], leftX, doc.y, { bulletRadius: 2 });
        doc.moveDown(0.4);

        doc.moveDown(0.6);
        doc.fontSize(9).font('Helvetica-Oblique').text('This FIR is generated using JusticeChain - a decentralized FIR management solution. Tampering, deletion, or unauthorized modification of this record is not possible. Powered by Blockchain and IPFS.');

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        saved.pdfPath = `/api/downloadFIR/${saved._id}`; 
        await saved.save();

        return res.json({ success: true, fir: saved });
    } catch (err) {
        console.error('Error saving FIR:', err);
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

module.exports = router;

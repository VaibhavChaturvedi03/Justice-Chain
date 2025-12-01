const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const FIR = require('../models/fir');

// Helper to generate FIR number
function generateFIRNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FIR${year}${random}${timestamp.toString().slice(-6)}`;
}

// Ensure pdf directory exists
const pdfDir = path.join(__dirname, '..', 'fir_pdfs');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// Accept JSON FIR payload and save to MongoDB, generate PDF
router.post('/uploadFIR', async (req, res) => {
    try {
        const data = req.body;

        // Generate server-side FIR number
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

        // Generate PDF
        const pdfPath = path.join(pdfDir, `fir_${saved._id}.pdf`);
        const doc = new PDFDocument({ autoFirstPage: true });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(20).text('FIR Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`FIR Number: ${saved.firNumber}`);
        doc.text(`Filed Date: ${saved.filedDate || new Date().toISOString().split('T')[0]}`);
        doc.moveDown();

        doc.fontSize(14).text('Personal Information', { underline: true });
        doc.fontSize(11).text(`Name: ${saved.fullName || ''}`);
        doc.text(`Father's Name: ${saved.fatherName || ''}`);
        doc.text(`Age: ${saved.age || ''}`);
        doc.text(`Gender: ${saved.gender || ''}`);
        doc.text(`Phone: ${saved.phone || ''}`);
        doc.text(`Email: ${saved.email || ''}`);
        doc.moveDown();

        doc.fontSize(14).text('Incident Details', { underline: true });
        doc.fontSize(11).text(`Type: ${saved.incidentType || ''}`);
        doc.text(`Date: ${saved.incidentDate || ''} ${saved.incidentTime || ''}`);
        doc.text(`Location: ${saved.incidentLocation || ''}`);
        doc.moveDown();
        doc.fontSize(12).text('Description:', { underline: true });
        doc.fontSize(11).text(saved.incidentDescription || '', { align: 'left' });
        doc.moveDown();

        if (saved.suspectDetails) {
            doc.fontSize(12).text('Suspect Details:', { underline: true });
            doc.fontSize(11).text(saved.suspectDetails);
            doc.moveDown();
        }

        if (saved.witnessDetails) {
            doc.fontSize(12).text('Witness Details:', { underline: true });
            doc.fontSize(11).text(saved.witnessDetails);
            doc.moveDown();
        }

        doc.end();

        // Wait for stream to finish
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        saved.pdfPath = `/api/downloadFIR/${saved._id}`; // logical download path
        await saved.save();

        return res.json({ success: true, fir: saved });
    } catch (err) {
        console.error('Error saving FIR:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Download endpoint — streams the generated PDF
router.get('/downloadFIR/:id', async (req, res) => {
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

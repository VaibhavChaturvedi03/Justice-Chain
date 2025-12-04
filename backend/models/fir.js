const mongoose = require('mongoose');

const FIRSchema = new mongoose.Schema({
  firNumber: { type: String, required: true, unique: true },
  fullName: String,
  fatherName: String,
  age: String,
  gender: String,
  occupation: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  phone: String,
  email: String,
  idType: String,
  idNumber: String,
  incidentType: String,
  incidentDate: String,
  incidentTime: String,
  incidentLocation: String,
  incidentDescription: String,
  suspectDetails: String,
  witnessDetails: String,
  evidenceDescription: String,
  mediaFiles: Array,
  severity: Number,
  urgencyLevel: String,
  filedByUser: Object,
  status: { type: String, default: 'FIR Registered' },
  filedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] },
  timeline: { type: Array, default: [] },
  pdfPath: String,
  
  ipfsHash: String,
  ipfsMetadata: {
    uploadedAt: Date,
    fileName: String,
    contentType: String
  },
  
  mediaFilesIPFS: [{
    originalName: String,
    ipfsHash: String,
    size: Number,
    mimeType: String,
    mediaType: { type: String, enum: ['photo', 'video', 'document'], default: 'document' },
    uploadedAt: Date,
    pinataUrl: String 
  }]
}, { timestamps: true });

FIRSchema.index({ firNumber: 1 });
FIRSchema.index({ email: 1 });
FIRSchema.index({ phone: 1 });
FIRSchema.index({ idNumber: 1 });
FIRSchema.index({ status: 1 });
FIRSchema.index({ state: 1 }); 
FIRSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FIR', FIRSchema);

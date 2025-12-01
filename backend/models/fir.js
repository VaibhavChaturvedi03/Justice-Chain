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
  pdfPath: String
}, { timestamps: true });

module.exports = mongoose.model('FIR', FIRSchema);

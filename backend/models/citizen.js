const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Citizen', citizenSchema);

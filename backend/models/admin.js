const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: false },
    phone: { type: String, required: false },
    empId: { type: String, required: false },
    department: { type: String, required: false },
    designation: { type: String, required: false },
    officeAddress: { type: String, required: false },
    state: { 
        type: String, 
        enum: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ],
        required: false 
    },
    city: { type: String, required: false },
    policeStation: { type: String, required: false },
    badge: { type: String, required: false }
}, { timestamps: true });

adminSchema.index({ state: 1 });

module.exports = mongoose.model('Admin', adminSchema);


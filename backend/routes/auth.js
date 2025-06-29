const express = require('express');
const bcrypt = require('bcryptjs');
const Citizen = require('../models/citizen');
const Admin = require('../models/admin');
const router = express.Router();

// Citizen Register
router.post('/citizen/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        const existingUser = await Citizen.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Citizen with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Citizen({
            fullName,
            email,
            phone,
            password: hashedPassword
        });
        await newUser.save();

        res.json({ message: 'Citizen registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Citizen Login
router.post('/citizen/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Citizen.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Citizen not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.json({ message: 'Citizen logged in successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Register
router.post('/admin/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            email,
            password: hashedPassword
        });
        await newAdmin.save();

        res.json({ message: 'Admin registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.json({ message: 'Admin logged in successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


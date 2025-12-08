const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const firRoutes = require('./routes/FIR');

const app = express();
const PORT = process.env.PORT || 4000;

const MONGO_CONN = process.env.MONGO_URL || process.env.MONGODB_URI || '';

if (!MONGO_CONN) {
  console.error('ERROR: No MongoDB connection string found. Set MONGO_URL or MONGODB_URI in your .env');
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', upload.array('files'), firRoutes);

mongoose.connect(MONGO_CONN)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });



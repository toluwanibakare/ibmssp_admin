const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/error');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://admin.ibmssp.org.ng',
        'https://www.ibmssp.org.ng',
        'https://ibmssp.org.ng'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// File Uploads
app.use(fileUpload());

// Serve Static Files (Uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy', data: null });
});

// Error handling
app.use(errorHandler);

module.exports = app;

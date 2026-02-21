const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/MemberController');
const EmailController = require('../controllers/EmailController');
const LogController = require('../controllers/LogController');
const AuthController = require('../controllers/AuthController');
const { verifyApiKey } = require('../middleware/auth');
const { protect } = require('../middleware/protect');

// Auth (public)
router.post('/auth/login', AuthController.login);
router.get('/auth/me', protect, AuthController.getMe);

// Registration (WordPress Webhook - API key protected)
router.post('/register', verifyApiKey, MemberController.register);

// Members (JWT Protected)
router.get('/members', protect, MemberController.list);
router.get('/members/:id', protect, MemberController.getById);
router.patch('/members/:id/approve', protect, MemberController.approve);

// Email (JWT Protected)
router.post('/email/send', protect, EmailController.send);

// Activity Logs (JWT Protected)
router.get('/logs', protect, LogController.list);

module.exports = router;

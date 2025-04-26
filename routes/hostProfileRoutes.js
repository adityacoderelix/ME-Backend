// routes/hostProfileRoutes.js
const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/hostProfileController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to send OTP
router.post('/host-profile/send-otp', authMiddleware, sendOtp);

// Route to verify OTP and create host profile
router.post('/host-profile/verify-otp',authMiddleware, verifyOtp);

module.exports = router;

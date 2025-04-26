// File: routes/authRoutes.js
const express = require('express');
const { checkEmail, verifyOtp } = require('../controllers/authController');

const router = express.Router();

// Route to check email and send OTP

module.exports = router;

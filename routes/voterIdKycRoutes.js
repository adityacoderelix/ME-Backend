// routes/kycRoutes.js
const express = require('express');
const router = express.Router();
const {verifyKYC} = require('../controllers/panKycController');

router.post('/verify', verifyKYC);

module.exports = router;
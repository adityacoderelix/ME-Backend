// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { generateKycUrl,
        getKycDetails, 
} = require('../controllers/kycController');

const {verifyPan} = require("../controllers/kyc/panController");

router.post("/generate-url", generateKycUrl);
router.get("/:transactionId/details", getKycDetails);

router.get("/verify/pan", verifyPan);

module.exports = router;





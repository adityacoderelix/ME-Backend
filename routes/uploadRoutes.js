const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router.post('/generate-presigned-url', uploadController.generatePresignedUrl);

module.exports = router;
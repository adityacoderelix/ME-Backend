const express = require("express");
const uploadController = require("../controllers/uploadController");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/", upload.array("images", 10), uploadController.uploadImages);
router.post("/generate-presigned-url", uploadController.generatePresignedUrl);

module.exports = router;

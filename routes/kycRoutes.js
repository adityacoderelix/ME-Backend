// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  generateKycUrl,
  getKycDetails,
} = require("../controllers/kycController");

const { verifyPan } = require("../controllers/kyc/panController");
const hostFormController = require("../controllers/kyc/hostFormController");
const { verifyGst } = require("../controllers/gstController");
router.post("/generate-url", generateKycUrl);
router.get("/:transactionId/details", getKycDetails);

router.get("/verify/pan", verifyPan);

router.post("/form", hostFormController.createhostKycForm);
router.put("/update-form/:id", hostFormController.updatehostKycForm);
router.get("/form/:id", hostFormController.fetchhostKycForm);
router.get("/form-kyc/:id", hostFormController.fetchhostKycFormById);

router.post("/verify/gst", verifyGst);
router.patch("/verify-status", hostFormController.updatehostKycFormStatus);
router.patch(
  "/verify-gst-status",
  hostFormController.updatehostKycFormGstStatus
);
module.exports = router;

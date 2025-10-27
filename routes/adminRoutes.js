// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  createAdmin,
  serviceFees,
  getServiceFees,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", createAdmin);
router.post("/service", authMiddleware, serviceFees);
router.get("/service", authMiddleware, getServiceFees);

// router.get("/", getAllAdmins);
// router.post("/", createAdmin);
// router.put("/:id", updateAdmin);
// router.delete("/:id", deleteAdmin);

module.exports = router;

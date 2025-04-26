// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { requestOTP, verifyOTP, createAdmin} = require("../controllers/adminController");

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', createAdmin);


// router.get("/", getAllAdmins);
// router.post("/", createAdmin);
// router.put("/:id", updateAdmin);
// router.delete("/:id", deleteAdmin);

module.exports = router;

// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/accountsController");

// Route for fetching profile data
router.get("/", getProfile);

// Route for updating/saving profile data
router.put("/", updateProfile);

module.exports = router;

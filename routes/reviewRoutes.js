const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, reviewController.submitReview);
router.post("/verify", authMiddleware, reviewController.verifyToken);
router.get("/:propertyId", reviewController.getPropertyReview);
router.get("/checking/:id", reviewController.checkReview);

module.exports = router;

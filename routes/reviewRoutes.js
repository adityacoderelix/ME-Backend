const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, reviewController.submitReview);
router.post("/guest", authMiddleware, reviewController.submitHostReview);
router.post("/verify", authMiddleware, reviewController.verifyToken);
router.patch("/update", authMiddleware, reviewController.updateReview);
router.get("/:propertyId", reviewController.getPropertyReview);
router.get("/checking/:id", reviewController.checkReview);
router.get("/host/checking/:id", reviewController.checkHostReview);

module.exports = router;

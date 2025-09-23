const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const shareController = require("../controllers/shareController");

// Get the availability for a specific experience
router.get("/:experienceId", calendarController.getAvailability);

// Block or unblock a specific date for a given experience
router.put("/:experienceId/block", calendarController.blockDate);

// Mark a reservation date as unavailable
router.put(
  "/:experienceId/unavailable",
  calendarController.markDateUnavailable
);

// Share experience availability or booking info with another user
router.post("/share", shareController.createShare);

module.exports = router;

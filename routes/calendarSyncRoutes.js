const express = require("express");
const router = express.Router();
const calendarsyncController = require("../controllers/calendarsyncController");

router.post("/saveCalendar", calendarsyncController.saveCalendarUrl);
router.get("/ics/:secret.ics", calendarsyncController.exportCalendar);

module.exports = router;

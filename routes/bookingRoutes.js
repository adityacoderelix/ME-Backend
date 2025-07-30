const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
// Create a new booking
router.post("/", authMiddleware, bookingController.createBooking);

// Get all bookings (admin or host-specific)
router.get("/", authMiddleware, bookingController.getAllBookings);

//Get all bookings (user)
router.get("/data", authMiddleware, bookingController.getAllUserBookings);

// Mark booking as paid
router.post(
  "/updateStatus",
  authMiddleware,
  bookingController.markBookingAsPaid
);

// Get bookings for a specific user
router.get(
  "/user/:userId",
  authMiddleware,
  bookingController.getBookingsByUser
);

// Get bookings for a specific host
router.get(
  "/host/:hostId",
  authMiddleware,
  bookingController.getBookingsByHost
);

// Get a specific booking by ID
router.get("/:bookingId", authMiddleware, bookingController.getBookingById);

// Update a booking (e.g., change dates, update status)
router.put("/:bookingId", authMiddleware, bookingController.updateBooking);

// Cancel a booking
router.patch("/host/cancel", authMiddleware, bookingController.cancelBooking);

// Confirm a booking (host action)
router.patch("/host/confirm", authMiddleware, bookingController.confirmBooking);

// Delete a booking (admin or system cleanup)
router.delete("/:bookingId", authMiddleware, bookingController.deleteBooking);

module.exports = router;
//

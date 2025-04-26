const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings (admin or host-specific)
router.get('/', bookingController.getAllBookings);

// Get bookings for a specific user
router.get('/user/:userId', bookingController.getBookingsByUser);

// Get bookings for a specific host
router.get('/host/:hostId', bookingController.getBookingsByHost);

// Get a specific booking by ID
router.get('/:bookingId', bookingController.getBookingById);

// Update a booking (e.g., change dates, update status)
router.put('/:bookingId', bookingController.updateBooking);

// Cancel a booking
router.patch('/:bookingId/cancel', bookingController.cancelBooking);

// Confirm a booking (host action)
router.patch('/:bookingId/confirm', bookingController.confirmBooking);

// Mark booking as paid
router.patch('/:bookingId/pay', bookingController.markBookingAsPaid);

// Delete a booking (admin or system cleanup)
router.delete('/:bookingId', bookingController.deleteBooking);

module.exports = router;

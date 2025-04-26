const express = require('express');
const router = express.Router();
const { createBooking, getBookings } = require('../controllers/bookingInterestController');

router.post('/availability', createBooking);
router.get('/', getBookings);

module.exports = router;


const Booking = require('../models/BookingInterest');

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, dateFrom, dateTo, guests, specialOffers } = req.body;

    const newBooking = new Booking({
      propertyId,
      dateFrom,
      dateTo,
      guests,
      specialOffers
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      data: savedBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error retrieving bookings',
      error: error.message
    });
  }
};


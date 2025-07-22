const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const ListingProperty = require("../models/ListingProperty");
const Users = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");
// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);

    await booking.save();
    const { propertyId } = req.body;
    // const host = await ListingProperty.findById(propertyId);
    // console.log(host._id.toString());
    // booking.hostId = host._id.toString();
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all bookings (admin or host-specific)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific user
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate(
      "propertyId hostId"
    );
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific host
exports.getBookingsByHost = async (req, res) => {
  try {
    const bookings = await Booking.find({ hostId: req.params.hostId }).populate(
      "userId propertyId"
    );
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "userId propertyId hostId"
    );
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      req.body,
      { new: true }
    );
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId, userEmail } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // await sendEmail(userEmail,11)
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
//
// Confirm a booking
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId, userEmail } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "confirmed",
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // await booking.save();
    // await sendOTPEmail(recipient, firstName, otp);
    // await sendEmail(userEmail,10)
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Mark booking as paid
exports.markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId, hostEmail, userId } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
    });

    const userEmail = await Users.findById(userId);

    // if (!booking)
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Booking not found" });

    // await sendEmail( userEmail.email, 7);
    // await sendEmail("majesticescape.in@gmail.com", 9);
    // await sendEmail(hostEmail, 8);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Utility to calculate refund (add your logic here)
const calculateRefund = (booking) => {
  // Example logic: Partial refund based on cancellation policy
  const now = new Date();
  if (booking.cancellationPolicy === "strict") return 0;
  if (booking.cancellationPolicy === "moderate") return booking.price * 0.5;
  if (booking.cancellationPolicy === "flexible") return booking.price * 0.75;
  return 0;
};

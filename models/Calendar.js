const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true }, // Reference to the experience
  dates: [
    {
      date: { type: Date, required: true },
      available: { type: Boolean, default: true }, // Is the date available for booking
      blocked: { type: Boolean, default: false },  // Is the date blocked (not available)
      reservationStatus: {
        type: String,
        enum: ['reserved', 'pending', 'available', 'unavailable'],
        default: 'available'
      },
      bookingDetails: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user who reserved the date
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Reference to booking record
        createdAt: { type: Date, default: Date.now } // When the reservation was made
      }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;

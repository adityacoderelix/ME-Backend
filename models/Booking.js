const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ListingProperty",
    required: true,
  },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid", "refunded"],
    default: "unpaid",
  },
  cancellationPolicy: {
    type: String,
    enum: ["strict", "moderate", "flexible"],
    default: "moderate",
  },
  guests: {
    type: Number,
    default: 1,
  },
  adults: {
    type: Number,
    default: 1,
  },
  children: {
    type: Number,
  },
  infants: {
    type: Number,
    max: 5,
  },
  nights: {
    type: Number,
  },
  guestData: {
    adults: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: false }, // Optional for adults
      },
    ],
    children: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true }, // Usually required for kids
      },
    ],
  },

  reviewed: {
    type: Boolean,
    default: false,
  },
  refundAmount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  amount: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    default: "INR",
  },

  status: {
    type: String,
    enum: ["created", "paid", "failed", "refund initiated", "refunded"],
    default: "created",
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  customerDetails: {
    name: String,
    email: String,
    contact: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);

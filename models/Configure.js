const mongoose = require("mongoose");

const configureSchema = new mongoose.Schema(
  {
    gst: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    razorpay: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Make sure you're creating the model correctly
module.exports = mongoose.model("Configure", configureSchema);

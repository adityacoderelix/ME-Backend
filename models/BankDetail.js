const mongoose = require("mongoose");

const bankDetailSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    contactId: {
      type: String,
      required: true,
    },
    fundId: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      minLength: 9,
      maxLength: 18,
    },
    ifsc: {
      type: String,
      required: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Make sure you're creating the model correctly
module.exports = mongoose.model("BankDetail", bankDetailSchema);

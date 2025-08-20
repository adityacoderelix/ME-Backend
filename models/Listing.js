const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  // Property details
  propertyType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },

  // Capacity details
  guests: { type: Number, required: true, min: 1 },
  bedrooms: { type: Number, required: true, min: 1 },
  beds: { type: Number, required: true, min: 1 },
  bathrooms: { type: Number, required: true, min: 1 },

  // Location information
  address: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  neighborhood: { type: String },

  // Media
  photos: [{ type: String }],
  videoTour: { type: String },

  // Amenities
  amenities: [{ type: String }],
  accessibility: [{ type: String }],
  petFriendly: { type: Boolean, default: false },

  // Pricing and booking options
  basePrice: { type: String, required: true },
  cleaningFee: { type: String },
  weeklyDiscount: { type: Number, default: 0 },
  monthlyDiscount: { type: Number, default: 0 },
  cancellationPolicy: {
    type: String,
    enum: ["Flexible", "Moderate", "Strict"],
  },
  instantBook: { type: Boolean, default: false },
  flashBook: { type: Boolean, default: false },
  securityDeposit: { type: String },

  // House rules
  selectedRules: [{ type: String }],
  customRules: [{ type: String }],

  // Host details
  hostName: { type: String, required: true },
  hostContact: { type: String, required: true },
  hostResponseTime: { type: String },

  // Availability
  availableDates: [{ type: Date }],
  minimumStay: { type: Number, default: 1 },
  maximumStay: { type: Number },

  // Safety and security
  safetyFeatures: [{ type: String }],
  emergencyContact: { type: String },
  firstAidKit: { type: Boolean, default: false },

  // Reviews and ratings
  reviews: [
    {
      reviewer: { type: String },
      comment: { type: String },
      rating: { type: Number, min: 0, max: 5 },
    },
  ],
  rating: { type: Number, default: 0 },

  // Additional services
  extraServices: [{ type: String }],
  childFriendly: { type: Boolean, default: false },
  workspace: { type: Boolean, default: false },

  // Metadata
  listingStatus: { type: String, default: "Draft" },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date },
});

module.exports = mongoose.model("Property", propertySchema);

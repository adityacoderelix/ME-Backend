const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  images: [
    {
      id: { type: String, required: true },
      url: { type: String, required: true },
      alt: { type: String, required: true },
    },
  ],
  pricePerNight: { type: Number, required: true },
  stayDetails: {
    guests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
  },
  fees: {
    platformFee: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    discount: { type: Number, required: true },
  },
  defaultDates: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
  },
  maxGuests: { type: Number, required: true },
  amenities: [
    {
      name: { type: String, required: true },
      icon: { type: String, required: true },
    },
  ],
  host: {
    name: { type: String, required: true },
    profileImage: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    stays: { type: Number, required: true },
    description: { type: String, required: true },
    joinDate: { type: Date, required: true },
    responseRate: { type: Number, required: true },
    responseTime: { type: String, required: true },
  },
  reviews: [
    {
      user: { type: String, required: true },
      date: { type: Date, required: true },
      content: { type: String, required: true },
      rating: { type: Number, required: true },
      avatar: { type: String, required: true },
    },
  ],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  attractions: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Property', PropertySchema);
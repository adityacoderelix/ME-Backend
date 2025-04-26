// models/Property.js
const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'Luxury Villa',
      'Private Pool Villa',
      'Heritage Villa',
      'Beach Villa',
      'Mountain Villa',
      'Farm House',
      'Traditional Farm Stay',
      'Modern Farm House',
      'Eco Farm',
      'Private Pool',
      'Infinity Pool',
      'Pool House',
      'Luxury Apartment',
      'Penthouse',
      'Studio Apartment',
      'Service Apartment',
      'Beachfront Resort',
      'Beachfront Villa',
      'Beachfront Cottage',
      'Tree House',
      'Cottage',
      'Bungalow',
      'Boutique Stay'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Luxury',
      'Budget',
      'Mid-Range',
      'Ultra Luxury',
      'Heritage',
      'Eco-Friendly'
    ]
  },
  amenities: [{
    type: String,
    enum: [
      'Private Pool',
      'Garden',
      'Beach Access',
      'Mountain View',
      'Sea View',
      'Wifi',
      'Air Conditioning',
      'Kitchen',
      'Parking',
      'BBQ',
      'Game Room',
      'Gym',
      'Home Theater',
      'Indoor Games',
      'Jacuzzi',
      'Kids Play Area',
      'Party Area',
      'Pet Friendly',
      'Power Backup',
      'Security',
      'Spa',
      'Tennis Court',
      'Yoga Deck'
    ]
  }],
  images: [{
    type: String,
    required: true
  }],
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  price: {
    base: {
      type: Number,
      required: true
    },
    cleaning: {
      type: Number,
      default: 0
    },
    service: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    }
  },
  capacity: {
    guests: {
      type: Number,
      required: true
    },
    bedrooms: {
      type: Number,
      required: true
    },
    beds: {
      type: Number,
      required: true
    },
    bathrooms: {
      type: Number,
      required: true
    }
  },
  badge: {
    type: String,
   
  },
  rating: {
    score: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  policies: {
    checkIn: {
      type: String,
      default: '14:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict'],
      required: true
    },
    houseRules: [{
      type: String
    }]
  },
  availability: {
    minStay: {
      type: Number,
      default: 1
    },
    maxStay: {
      type: Number,
      default: 30
    },
    instantBook: {
      type: Boolean,
      default: false
    },
    unavailableDates: [{
      type: Date
    }]
  },
  description: {
    short: {
      type: String,
      required: true,
      maxLength: 200
    },
    detailed: {
      type: String,
      required: true
    }
  },
  host: {
    name: {
      type: String,
      required: true
    },
    contact: {
      phone: String,
      email: String
    },
    isSuperhost: {
      type: Boolean,
      default: false
    },
    response: {
      rate: {
        type: Number,
        default: 0
      },
      time: {
        type: String,
        enum: ['Within an hour', 'Within a few hours', 'Within a day']
      }
    }
  }
}, {
  timestamps: true
});

// Add indexes for common queries
staySchema.index({ type: 1 });
staySchema.index({ category: 1 });
staySchema.index({ 'price.base': 1 });
staySchema.index({ city: 1 });
staySchema.index({ state: 1 });
staySchema.index({ 'rating.score': -1 });

// Virtual for total price calculation
staySchema.virtual('totalPrice').get(function() {
  return this.price.base + 
         this.price.cleaning + 
         this.price.service + 
         this.price.tax;
});

// Method to check availability for specific dates
staySchema.methods.isAvailable = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !this.availability.unavailableDates.some(date => {
    return date >= start && date <= end;
  });
};

module.exports = mongoose.model('Stay', staySchema);
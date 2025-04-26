const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true }, // Reference to the experience
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who is sharing
  sharedWithUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who receives the shared info
  shareType: { 
    type: String, 
    enum: ['availability', 'booking', 'both'], 
    required: true 
  }, // What type of information is shared: availability, booking, or both
  shareDate: { type: Date, default: Date.now }, // When the sharing occurred
  message: { type: String }, // Optional message with the share
});

const Share = mongoose.model('Share', shareSchema);

module.exports = Share;

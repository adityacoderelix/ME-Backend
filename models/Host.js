const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who is the host
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }], // Array of property IDs that the host manages
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Host = mongoose.model('Host', hostSchema);

module.exports = Host;

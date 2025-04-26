const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  image: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Blog', blogSchema);

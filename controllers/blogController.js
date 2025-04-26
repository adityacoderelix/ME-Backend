const Blog = require('../models/Blog');

exports.getRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 }).limit(4);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blogs', error: err });
  }
};

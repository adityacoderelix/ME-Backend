const express = require('express');
const { getRecentBlogs } = require('../controllers/blogController');
const router = express.Router();

router.get('/recent', getRecentBlogs);

module.exports = router;

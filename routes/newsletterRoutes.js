const express = require('express');
const { subscribeToNewsletter, bulkSubscribeToNewsletter } = require('../controllers/newsletterController');

const router = express.Router();

router.post('/', subscribeToNewsletter);
router.post('/bulk', bulkSubscribeToNewsletter);

module.exports = router;

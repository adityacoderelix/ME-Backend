const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const propertyController = require('../controllers/propertyController');

// Get all hosts and their properties
router.get('/', hostController.getAllHosts);

// Get a single host and their properties
router.get('/:hostId', hostController.getHostById);

// Add a new property for a host
router.post('/:hostId/properties', propertyController.addProperty);

// Get all properties of a specific host
router.get('/:hostId/properties', propertyController.getHostProperties);

module.exports = router;

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyRegistrationNoController');

// POST endpoint to save property data (expects an array of JSON objects in the request body)
router.get('/', propertyController.getAll);
router.post('/', propertyController.saveProperties);

// GET endpoint to check if a registration number exists (ignores case)
router.get('/:registrationNo', propertyController.checkRegistrationNoExists);

module.exports = router;

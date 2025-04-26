const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

// Create a new experience
router.post('/', experienceController.createExperience);

// Get all experiences (with optional filters like location, price, etc.)
router.get('/', experienceController.getAllExperiences);

// Get a single experience by ID
router.get('/:id', experienceController.getExperienceById);

// Update an experience by ID
router.put('/:id', experienceController.updateExperience);

// Delete an experience by ID
router.delete('/:id', experienceController.deleteExperience);

// Get experiences by host ID
router.get('/host/:hostId', experienceController.getExperiencesByHost);

module.exports = router;

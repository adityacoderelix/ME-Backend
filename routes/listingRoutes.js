import express from 'express';
import ListingController from '../controllers/listingController';

const router = express.Router();

// Step 1: Create Listing
router.post('/add-listing', ListingController.createListing);

// Step 2: Add Location Details
router.post('/add-listing/location', ListingController.addLocation);

// Step 3: Add Final Details (amenities, rules)
router.post('/add-listing/final-details', ListingController.addFinalDetails);

// Step 4: Submit Listing
router.post('/submit-listing', ListingController.submitListing);

export default router;

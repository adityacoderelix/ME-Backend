import { Request, Response } from 'express';
import Listing from '../models/Listing';  // Assuming you have a listing model for storing the data

class ListingController {
  // Step 1: Create a listing entry in the database
  async createListing(req, res) {
    try {
      const { title, description, propertyType, bedrooms, bathrooms, maxGuests, price, images } = req.body;
      
      // Create a new listing
      const newListing = new Listing({
        title,
        description,
        propertyType,
        bedrooms,
        bathrooms,
        maxGuests,
        price,
        images
      });
      
      await newListing.save();
      res.status(200).json({ message: 'Listing created successfully', listing: newListing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  // Step 2: Add the location details (address, city, state, zipcode)
  async addLocation(req, res) {
    try {
      const { listingId, address, city, state, zipcode } = req.body;
      
      // Find the listing and update location details
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      listing.address = address;
      listing.city = city;
      listing.state = state;
      listing.zipcode = zipcode;

      await listing.save();
      res.status(200).json({ message: 'Location added successfully', listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add location' });
    }
  }

  // Step 3: Add amenities, rules, and cancellation policy
  async addFinalDetails(req, res) {
    try {
      const { listingId, amenities, houseRules, cancellationPolicy } = req.body;
      
      // Find the listing and update final details
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      listing.amenities = amenities;
      listing.houseRules = houseRules;
      listing.cancellationPolicy = cancellationPolicy;

      await listing.save();
      res.status(200).json({ message: 'Final details added successfully', listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add final details' });
    }
  }

  // Submit the listing after finalizing
  async submitListing(req, res) {
    try {
      const { listingId } = req.body;
      
      // Mark the listing as submitted
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      listing.status = 'submitted';  // You can add a status field to track the listing's progress
      await listing.save();
      
      res.status(200).json({ message: 'Listing submitted successfully', listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit listing' });
    }
  }
}

export default new ListingController();

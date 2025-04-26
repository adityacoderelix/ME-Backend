const Property = require("../models/Property");
const ListingProperty = require("../models/ListingProperty");
const {
  dummyHostData,
  dummyReviewsData,
  dummyPropertyData,
} = require("../utils/data");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

exports.getAllStays = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const { type } = req.query;

    // Build query object
    let query = {};
    if (type) {
      query.type = type;
    }
    // Only include documents with status 'processing' or 'completed'
    query.status = { $in: ['active', 'completed'] };

    // Execute queries in parallel for better performance
    const [properties, totalProperties] = await Promise.all([
      ListingProperty.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      ListingProperty.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProperties / limit);
    const hasMore = page * limit < totalProperties;

    // Send response
    res.status(200).json({
      properties,
      currentPage: page,
      totalPages,
      totalProperties,
      hasMore,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};



exports.getAllStaticProperties = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const { type } = req.query;

    // Build query object
    let query = {};
    if (type) {
      query.type = type;
    }

    // Execute queries in parallel for better performance
    const [properties, totalProperties] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Property.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProperties / limit);
    const hasMore = page * limit < totalProperties;

    // Send response
    res.status(200).json({
      properties,
      currentPage: page,
      totalPages,
      totalProperties,
      hasMore,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

// controllers/propertyController.js
exports.getAllProperties = async (req, res) => {
  console.log("getAllProperties");
  try {
    // Get pagination parameters from query with radix specified
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const { type } = req.query;

    // Build query object
    const query = {};
    if (type) {
      query.type = type;
    }

    // Execute queries in parallel for better performance
    const [properties, totalProperties] = await Promise.all([
      ListingProperty.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      ListingProperty.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProperties / limit);
    const hasMore = page * limit < totalProperties;

    // Send response
    res.status(200).json({
      properties,
      currentPage: page,
      totalPages,
      totalProperties,
      hasMore,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};


exports.getProcessingListingsForAdmin = async (req, res) => {
  try {
    // ---- STATS ----
    const totalListings = await ListingProperty.countDocuments({});
    const totalActiveListings = await ListingProperty.countDocuments({ status: "active" });
    const totalPendingListings = await ListingProperty.countDocuments({ status: "processing" });
    
    // Count how many listings were created "today"
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // midnight of current day
    const listingsToday = await ListingProperty.countDocuments({
      createdAt: { $gte: startOfToday },
    });
    
    // ---- PAGINATION FOR PROCESSING LISTINGS ----
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    // We want only "processing" listings
    const query = { status: "processing" };
    
    // Fetch the listing data in parallel
    const [properties, totalProperties] = await Promise.all([
      ListingProperty.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ListingProperty.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProperties / limit);
    const hasMore = page * limit < totalProperties;

    return res.status(200).json({
      // Stats
      totalListings,
      totalActiveListings,
      totalPendingListings,
      listingsToday,
      // Listings
      properties,
      currentPage: page,
      totalPages,
      totalProperties,
      hasMore,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching admin listings:", error);
    res.status(500).json({
      message: "Failed to fetch admin listings",
      error: error.message,
    });
  }
};

exports.getFilteredListingsForAdmin = async (req, res) => {
  try {
    // ---- STATS ----
    const totalListings = await ListingProperty.countDocuments({});
    const totalActiveListings = await ListingProperty.countDocuments({ status: "active" });
    const totalPendingListings = await ListingProperty.countDocuments({ status: "processing" });
    
    // Count how many listings were created "today"
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // midnight of current day
    const listingsToday = await ListingProperty.countDocuments({
      createdAt: { $gte: startOfToday },
    });
    
    // ---- PAGINATION FOR FILTERED LISTINGS ----
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    // Get the status filter from the query
    const statusFilter = req.query.status || 'all'; // Default to 'all' if no status is provided
console.log("Status", statusFilter)

    // Prepare the query based on the status filter
    let query = {};
    if (statusFilter !== 'all') {
      query.status = statusFilter; // Only filter by status if it's not 'all'
    }

    // Fetch the listing data in parallel
    const [properties, totalProperties] = await Promise.all([
      ListingProperty.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ListingProperty.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProperties / limit);
    const hasMore = page * limit < totalProperties;

    return res.status(200).json({
      // Stats
      totalListings,
      totalActiveListings,
      totalPendingListings,
      listingsToday,
      // Listings
      properties,
      currentPage: page,
      totalPages,
      totalProperties,
      hasMore,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching filtered listings for admin:", error);
    res.status(500).json({
      message: "Failed to fetch filtered listings for admin",
      error: error.message,
    });
  }
};




exports.approveListing = async (req, res) => {
  try {
    const { id } = req.params; // listing ID
    const updatedListing = await ListingProperty.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.status(200).json({
      message: "Listing approved successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Error approving listing:", error);
    return res.status(500).json({
      message: "Failed to approve listing",
      error: error.message,
    });
  }
};


exports.getPropertyById = async (req, res) => {
  try {
    const property = await ListingProperty.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    const propertyWithDummyData = {
      ...property.toObject(),
      // host: dummyHostData,
      reviewsData: dummyReviewsData,
      ...dummyPropertyData,
    };

    res.status(200).json(propertyWithDummyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  console.log("deleteProperty", req.params.id);
  try {
    const property = await ListingProperty.findByIdAndDelete(req.params.id);
    if (!property) {
      console.log("deleteProperty", "No property found");

      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createListingProperty = async (req, res) => {
  try {
    const { ...propertyData } = req.body;
    const user = await User.findOne({ email: req.body.hostEmail });

    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }

    const property = new ListingProperty({
      ...propertyData,
      // _id: new mongoose.Types.ObjectId(),
      host: user._id,
      status: "incomplete",
    });

    await property.save();
    console.log(property);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateListingProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ email: req.body.hostEmail });
    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }
    console.log("jjj", req.body._id);

    const property = await ListingProperty.findOneAndUpdate(
      { _id: id, host: user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized to update" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getUserPropertyListings = async (req, res) => {
  const { userEmail } = req.params;
  console.log("userEmail", userEmail);
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { hostEmail: userEmail };
    const [listings, totalListings] = await Promise.all([
      ListingProperty.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("host", "firstName lastName email"),
      ListingProperty.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalListings / parseInt(limit));

    const response = {
      listings,
      currentPage: parseInt(page),
      totalPages,
      totalListings,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user property listings:", error);
    res.status(500).json({
      message: "Error fetching property listings",
      error: error.message,
    });
  }
};


exports.getPropertyListings = async (req, res) => {
  console.log("getPropertyListings");
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, totalListings] = await Promise.all([
      ListingProperty.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ListingProperty.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalListings / parseInt(limit));

    const response = {
      listings,
      currentPage: parseInt(page),
      totalPages,
      totalListings,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user property listings:", error);
    res.status(500).json({
      message: "Error fetching property listings",
      error: error.message,
    });
  }
};

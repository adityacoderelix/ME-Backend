const ListingProperty = require("../models/ListingProperty");
const Review = require("../models/Review");
const User = require("../models/User");
const { parseMDYToUTC } = require("../utils/convertDate");
// Get all hosts and their properties
exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find().populate("properties");
    res.status(200).json({ hosts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching hosts", error });
  }
};

// Get a single host and their properties
exports.getHostById = async (req, res) => {
  try {
    console.log(req.params.hostId);
    const host = await User.findById(req.params.hostId);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    console.log(host);
    res.status(200).json({ success: true, data: host });
  } catch (error) {
    res.status(500).json({ message: "Error fetching host", error });
  }
};

exports.getHostReviewsById = async (req, res) => {
  try {
    const { search, stars, email, checkin, checkout, property } = req.query;
    const ObjectId = require("mongoose").Types.ObjectId;

    // Host ID from params
    const hostId = new ObjectId(req.params.userId);

    // Step 1: Build base filter
    let filter = { hostId: hostId };

    // ⭐ Fix date filter
    if (checkin && checkout) {
      const range = parseMDYToUTC(checkin, checkout);
      filter.createdAt = { $gte: range.from, $lte: range.to };
    } else if (checkin && !checkout) {
      const singleDay = parseMDYToUTC(checkin); // pass only checkin
      filter.createdAt = { $gte: singleDay.from, $lte: singleDay.to };
    }
    if (stars && stars !== "all") {
      filter.rating = Number(stars);
    }

    // Step 2: Fetch reviews with population
    let reviews = await Review.find(filter)
      .populate({
        path: "bookingId",
        model: "Booking",
        select: "checkIn checkOut flag",
      })
      .populate({
        path: "property",
        select: "title hostEmail",
      })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .lean();

    // Step 3: Extra filters in JS
    if (search) {
      const s = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.content?.toLowerCase().includes(s) ||
          `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase().includes(s)
      );
    }

    if (property && property !== "all") {
      const p = property.toLowerCase();
      reviews = reviews.filter((r) =>
        r.property?.title?.toLowerCase().includes(p)
      );
    }

    // Step 4: Average rating
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: reviews,
      averageRating: avgRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Error in getHostReviewsById:", error);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { flagged, search, stars, checkin, checkout, property } = req.query;
    console.log("reached");
    const filter = {};

    // ⭐ Fix date filter
    if (checkin && checkout) {
      const range = parseMDYToUTC(checkin, checkout);
      filter.createdAt = { $gte: range.from, $lte: range.to };
    } else if (checkin && !checkout) {
      const singleDay = parseMDYToUTC(checkin); // pass only checkin
      filter.createdAt = { $gte: singleDay.from, $lte: singleDay.to };
    }
    if (stars && stars !== "all") {
      filter.rating = Number(stars);
    }

    // Step 2: Fetch reviews with population
    let reviews = await Review.find(filter)
      .populate({
        path: "bookingId",
        model: "Booking",

        select: "checkIn checkOut flag",
      })
      .populate({
        path: "property",
        select: "title",
      })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .lean();

    console.log("a", reviews);
    // Step 3: Extra filters in JS

    if (flagged && flagged == "true") {
      reviews = reviews.filter(
        (r) => r.bookingId.flag == true && r.hideStatus == "pending"
      );
    }

    if (search) {
      const s = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.content?.toLowerCase().includes(s) ||
          `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase().includes(s)
      );
    }

    if (property && property !== "all") {
      const p = property.toLowerCase();
      reviews = reviews.filter((r) =>
        r.property?.title?.toLowerCase().includes(p)
      );
    }

    // Step 4: Average rating
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: reviews,
      averageRating: avgRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Error in getHostReviewsById:", error);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

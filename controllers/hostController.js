const ListingProperty = require("../models/ListingProperty");
const Review = require("../models/Review");
const User = require("../models/User");
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
    const { search, stars, checkin, checkout, property } = req.query;
    const ObjectId = require("mongoose").Types.ObjectId;

    // Host ID from params
    const hostId = new ObjectId(req.params.userId);

    // Step 1: Build base filter
    let filter = { hostId: hostId };

    if (stars && stars != "all") {
      filter.rating = Number(stars);
    }
    const rawReviews = await Review.find(filter).lean();
    console.log(
      "Raw bookingIds in reviews:",
      rawReviews.map((r) => r.bookingId)
    );
    // Step 2: Fetch reviews with population
    let reviews = await Review.find(filter)
      .populate({
        path: "bookingId",
        model: "Booking",
        select: "checkIn checkOut", // we only need dates
      })
      .populate({
        path: "property",
        select: "title", // so we can filter by property name
      })
      .populate({
        path: "user",
        select: "firstName lastName", // so we can search guest name
      })
      .lean();
    console.log("Populate", reviews);
    // Step 3: Apply extra filters in JS

    // Search filter: matches review content OR user full name
    if (search) {
      const s = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.content?.toLowerCase().includes(s) ||
          `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase().includes(s)
      );
    }

    // Property name filter
    if (property && property != "all") {
      const p = property.toLowerCase();
      reviews = reviews.filter((r) =>
        r.property?.title?.toLowerCase().includes(p)
      );
    }

    // Check-in / Check-out filter
    if (checkin || checkout) {
      const start = new Date(checkin);
      start.setDate(start.getDate() + 1);
      const end = new Date(checkout);
      end.setDate(end.getDate() + 1);
      const from = checkin ? start : null;
      const to = checkout ? end : null;

      reviews = reviews.filter((r) => {
        const bookingCheckIn = r?.bookingId?.checkIn
          ? new Date(r?.bookingId?.checkIn)
          : null;
        const bookingCheckOut = r?.bookingId?.checkOut
          ? new Date(r?.bookingId?.checkOut)
          : null;
        console.log("rev7", bookingCheckIn, bookingCheckOut);
        if (!bookingCheckIn || !bookingCheckOut) return false;

        let isValid = true;

        if (from && bookingCheckIn < from) {
          isValid = false;
        }
        if (to && bookingCheckOut > to) {
          isValid = false;
        }

        return isValid;
      });
    }

    // Step 4: Calculate average & count
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
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

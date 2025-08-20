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
    const arr = [];
    const reviews = [];
    const ObjectId = require("mongoose").Types.ObjectId;
    const id = new ObjectId(`${req.params.userId}`);
    if (!id) {
      return res.status(404).json({ message: "No Host found" });
    }
    const result = await Review.aggregate([
      {
        $match: { hostId: id },
      },
      {
        $group: {
          _id: "$hostId",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this property.",
      });
    }
    const avgData = result[0] || {
      averageRating: 0,
      reviewCount: 0,
    };

    const getProperty = await ListingProperty.find({ host: id });
    for (let i in getProperty) {
      arr.push(getProperty[i]._id);
    }

    for (let i in arr) {
      const data = await Review.find({ property: arr[i] }).populate(
        "bookingId property user"
      );

      if (data) {
        reviews.push(data);
      }
    }
    if (!reviews) {
      return res.status(404).json({ message: "No Reviews found" });
    }

    res.status(200).json({
      success: true,
      data: reviews,
      averageRating: avgData.averageRating.toFixed(2),
      reviewCount: avgData.reviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching host", error });
  }
};

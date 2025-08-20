const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ListingProperty = require("../models/ListingProperty");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const mongoose = require("mongoose");

// exports.submitReview = async (req, res) => {
//   try {
//     const { bookingId, rating, content } = req.body;

//     // const review = new Review(req.body);

//     const booking = await Booking.findById(bookingId);

//     console.log("ssss", booking.hostId.toString());

//     const review = new Review({
//       bookingId: bookingId,
//       hostId: booking.hostId.toString(),
//       property: booking.propertyId.toString(),
//       user: booking.userId.toString(),
//       rating: rating,
//       content: content,
//     });
//     await review.save();
//     const result = await Review.aggregate([
//       {
//         $match: { property: booking.propertyId },
//       },
//       {
//         $group: {
//           _id: "$property",
//           averageRating: { $avg: "$rating" },
//           reviewCount: { $sum: 1 },
//         },
//       },
//     ]);
//     console.log("nice go 2", result);
//     if (result.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No reviews found for this property.",
//       });
//     }
//     const avgData = result[0] || {
//       averageRating: 0,
//       reviewCount: 0,
//     };
//     console.log(
//       "nice go",
//       avgData.averageRating.toFixed(2),
//       avgData.reviewCount
//     );
//     // const ObjectId = require("mongoose").Types.ObjectId;
//     // const id = new ObjectId(booking.propertyId.toString());
//     const data = await ListingProperty.findByIdAndUpdate(
//       booking.propertyId.toString(),
//       {
//         averageRating: Number(avgData.averageRating.toFixed(2)),
//         reviewCount: avgData.reviewCount,
//       }
//     );
//     if (!data) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Property not found" });
//     }

//     res.status(201).json({ success: true, data: data });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

exports.submitReview = async (req, res) => {
  try {
    const { bookingId, rating, content } = req.body;

    // 1. Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // 2. Create and save review
    const review = new Review({
      bookingId: booking._id,
      hostId: booking.hostId, // keep as ObjectId
      property: booking.propertyId, // keep as ObjectId
      user: booking.userId, // keep as ObjectId
      rating,
      content,
    });

    await review.save();
    const listproperty = await ListingProperty.findById(booking.propertyId);
    // 3. Calculate new average rating for this property
    if (!listproperty.averageRating) {
      const result = await Review.aggregate([
        {
          $match: { property: new mongoose.Types.ObjectId(booking.propertyId) },
        },
        {
          $group: {
            _id: "$property",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No reviews found for this property.",
        });
      }

      const avgData = {
        averageRating: Number(result[0].averageRating.toFixed(2)),
        reviewCount: result[0].reviewCount,
      };

      // 4. Update property ratings
      const updatedProperty = await ListingProperty.findByIdAndUpdate(
        booking.propertyId,
        {
          averageRating: avgData.averageRating,
          reviewCount: avgData.reviewCount,
        },
        { new: true }
      );
      if (!updatedProperty) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }
      res.status(201).json({
        success: true,
        data: updatedProperty,
      });
    } else {
      const averageRating =
        (Number(listproperty?.averageRating) *
          Number(listproperty?.reviewCount) +
          Number(rating)) /
        (Number(listproperty?.reviewCount) + 1);
      const reviewCount = Number(listproperty?.reviewCount) + 1;
      const updatedProperty = await ListingProperty.findByIdAndUpdate(
        booking.propertyId,
        {
          averageRating: averageRating,
          reviewCount: reviewCount,
        },
        { new: true }
      );
      if (!updatedProperty) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }
      res.status(201).json({
        success: true,
        data: updatedProperty,
      });
    }

    // 5. Respond success
  } catch (error) {
    console.error("Error in submitReview:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { emailToken } = req.body;
    console.log("abc");
    const verify = jwt.verify(emailToken, secret);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// exports.getPropertyReview = async (req, res) => {
//   try {
//     const ObjectId = require("mongoose").Types.ObjectId;
//     const id = new ObjectId(`${req.params.propertyId}`);
//     const review = await Review.find({ property: id }).populate("user");
//     console.log("ratingssss", review);
//     res.status(200).json({ success: true, data: review });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };
exports.getPropertyReview = async (req, res) => {
  try {
    const limitValue = parseInt(req.query.limit) || 2;
    const skipValue = parseInt(req.query.skip) || 0;
    const ObjectId = require("mongoose").Types.ObjectId;
    const id = new ObjectId(`${req.params.propertyId}`);
    const review = await Review.find({ property: id })
      .populate("user")
      .limit(limitValue)
      .skip(skipValue)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

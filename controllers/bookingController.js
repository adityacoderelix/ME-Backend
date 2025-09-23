const Booking = require("../models/Booking");

const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const ListingProperty = require("../models/ListingProperty");
const Users = require("../models/User");
const Agenda = require("agenda");
const { sendEmail } = require("../utils/sendEmail");
const User = require("../models/User");
const Razorpay = require("razorpay");
const getUnavailableDates = require("../services/getUnavailableDates");
const { blockedDates } = require("../services/blockedDates");
const TOKEN_EXPIRATION = "14d";
const mongoConnectionString = process.env.DB_URI;
const baseUrl = process.env.NEXTAUTH_URL;
const moderate = process.env.MODERATE_POLICY_DAYS * 24 * 60 * 60;
const flexible = process.env.FLEXIBLE_POLICY_DAYS * 60 * 60;
const key = process.env.RAZORPAY_KEY_ID;
const secret = process.env.RAZORPAY_KEY_SECRET;
// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "propertyId, checkIn and checkOut are required",
      });
    }

    const newCheckIn = new Date(checkIn);
    newCheckIn.setHours(0, 0, 0, 0);

    const newCheckOut = new Date(checkOut);
    newCheckOut.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(newCheckIn.getTime()) ||
      Number.isNaN(newCheckOut.getTime())
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    if (newCheckIn >= newCheckOut) {
      return res.status(400).json({
        success: false,
        message: "checkIn must be earlier than checkOut",
      });
    }

    // Find overlapping bookings
    const overlapping = await Booking.findOne({
      propertyId,
      status: { $nin: ["rejected", "cancelled"] },
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn }, // will catch overlap
    }).lean();

    if (overlapping) {
      // ✅ Special allowance: if new checkIn == existing checkOut → allow
      if (
        newCheckIn.getTime() ===
        new Date(overlapping.checkOut).setHours(0, 0, 0, 0)
      ) {
        // continue without blocking
      } else {
        return res.status(409).json({
          success: false,
          message: "Selected dates overlap with an existing booking",
        });
      }
    }

    // Save booking
    const booking = new Booking({
      ...req.body,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
    });

    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all bookings (admin or host-specific)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      source: "local",
      action: "user",
    }).populate("userId propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalyticsFilterBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      source: "local",
      action: "user",
    }).populate("userId propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// Get all filtered bookings (host-specific)
// exports.getBasicFilterBookings = async (req, res) => {
//   try {
//     const { search, status, from, to } = req.query;
//     console.log("daysof", search, status, from, to);
//     const bookings = await Booking.find({ source: "local" })
//       .populate("userId propertyId hostId")
//       .sort({ createdAt: -1 });

//     console.log("what is", from, to);
//     function filter(users) {
//       return users.filter((booking) => {
//         const matchesSearch =
//           booking.userId?.firstName
//             ?.toLowerCase()
//             .includes(search.toLowerCase()) ||
//           booking.userId?.lastName
//             ?.toLowerCase()
//             .includes(search.toLowerCase()) ||
//           (booking.userId?.firstName + " " + booking.userId?.lastName)
//             .toLowerCase()
//             .includes(search.toLowerCase()) ||
//           booking.propertyId?.title
//             ?.toLowerCase()
//             .includes(search.toLowerCase());

//         const matchesDate = from
//           ? new Date(booking.checkIn) >= new Date(from) &&
//             new Date(booking.checkIn) <= new Date()
//           : new Date(booking.checkIn) >= new Date(from);

//         const matchesStatus =
//           status.toLowerCase() === "all"
//             ? "true"
//             : booking.status?.toLowerCase() === status.toLowerCase();

//         return matchesSearch && matchesDate && matchesStatus;
//       });
//     }

//     const final = filter(bookings);
//     res.json({ success: true, data: final });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
exports.getAllFilterBookings = async (req, res) => {
  try {
    const { search, status, from, to, title, hostEmail } = req.query;
    console.log("rub", title);
    const filter = { source: "local", action: "user" };

    if (status && status.toLowerCase() !== "all") {
      filter.status = { $regex: new RegExp(status, "i") };
    }

    if (from || to) {
      filter.checkIn = {};
      if (from) filter.checkIn.$gte = new Date(from);
      if (to) filter.checkIn.$lte = new Date(to);
    }

    // Fetch bookings first
    let bookings = await Booking.find(filter)
      .populate("userId propertyId hostId")
      .sort({ createdAt: -1 })
      .lean();

    // Apply property title & user search in JS

    if (title && title.toLowerCase() !== "all") {
      bookings = bookings.filter((item) =>
        item.propertyId?.title?.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (hostEmail && hostEmail.toLowerCase() !== "all") {
      bookings = bookings.filter((item) =>
        item.hostId?.email?.toLowerCase().includes(hostEmail.toLowerCase())
      );
    }

    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter((b) =>
        b.propertyId?.title?.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day (11:59:59 PM)
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();
    // Query: checkIn <= endOfDay AND checkOut >= startOfDay
    const bookings = await Booking.find({
      checkIn: { $lte: endOfDay },
      checkOut: { $gte: startOfDay },
    }).populate("userId propertyId hostId");

    const bookingData = bookings.filter((item) => {
      if (!item.propertyId?.checkinTime || !item.propertyId?.checkoutTime) {
        return false; // skip if property has no time info
      }

      // Build full datetime objects for checkin & checkout
      const checkinDateTime = new Date(item.checkIn);
      checkinDateTime.setHours(item.propertyId.checkinTime, 0, 0, 0);

      const checkoutDateTime = new Date(item.checkOut);
      checkoutDateTime.setHours(item.propertyId.checkoutTime, 0, 0, 0);

      // Current time must fall between checkin and checkout datetimes
      return now >= checkinDateTime && now <= checkoutDateTime;
    });

    res.json({ success: true, data: bookingData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllHostEmails = async (req, res) => {
  const emails = await ListingProperty.find({
    status: "active",
  });
  if (!emails) {
    return res
      .status(404)
      .json({ success: false, message: "Host email not found" });
  }

  res.status(200).json({ success: true, data: emails });
};
exports.getAllUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      source: "local",
      action: "user",
    }).populate("userId propertyId hostId");
    if (!bookings) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific user
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.params.userId,
      source: "local",
    }).populate("propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific host
exports.getBookingsByHost = async (req, res) => {
  try {
    const bookings = await Booking.find({
      hostId: req.params.hostId,
      source: "local",
      action: "user",
    }).populate("userId propertyId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookingsByHostGroupByUsers = async (req, res) => {
  try {
    const { search, from, to, title, hostId } = req.query;
    console.log("mys", hostId);
    const mongoose = require("mongoose");

    // 1. Build filter
    const filter = { source: "local", action: "user", status: "confirmed" };

    if (hostId && hostId.toLowerCase() != "all") {
      filter.hostId = new mongoose.Types.ObjectId(hostId);
    }

    if (from || to) {
      filter.checkIn = {};
      if (from) filter.checkIn.$gte = new Date(from);
      if (to) filter.checkIn.$lte = new Date(to);
    }

    // 2. Aggregation pipeline
    let bookings = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$userId",
          totalBookings: { $sum: 1 },
          totalAmountSpent: { $sum: "$price" },

          totalReviews: {
            $sum: {
              $cond: [
                {
                  $or: [{ $eq: ["$reviewed", true] }],
                },
                1,
                0,
              ],
            },
          },
          // keep refs for populate
          userId: { $first: "$userId" },
        },
      },
      { $sort: { totalBookings: -1 } }, // sort inside pipeline
    ]);
    console.log("p1", bookings);
    // 3. Populate refs
    bookings = await Booking.populate(bookings, [
      { path: "userId", select: "firstName lastName email averageRating" },
      { path: "hostId", select: "email" },
      { path: "propertyId", select: "title" },
    ]);
    console.log("p2", bookings);
    // 4. Apply JS filters after populate
    if (title && title.toLowerCase() !== "all") {
      bookings = bookings.filter((item) =>
        item.propertyId?.title?.toLowerCase().includes(title.toLowerCase())
      );
    }
    console.log("p3", bookings);
    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.propertyId?.title?.toLowerCase().includes(s) ||
          `${b.userId?.firstName} ${b.userId?.lastName}`
            .toLowerCase()
            .includes(s)
      );
    }

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "userId propertyId hostId"
    );
    console.log("try try", booking);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      req.body,
      { new: true }
    );
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Reject a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "rejected",
    });
    const params = { userName: userName, hostName: hostName };
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const instance = new Razorpay({ key_id: key, key_secret: secret });
    let refundSuccessful = false;

    const paymentData = await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refund initiated" },
      { new: true }
    );
    console.log("batm1");
    const payment = await Payment.findOne({ bookingId: bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment refund initiation failed",
      });
    }
    console.log("batm2");
    const refund = await instance.payments.refund(payment.paymentId, {
      amount: payment.amount,
      speed: "normal",
      notes: { notes_key_1: "Full Refund" },
      receipt: `Refund No. ${bookingId}`,
    });
    console.log("batm3");
    if (!refund) {
      return res
        .status(404)
        .json({ success: false, message: "Payment refund failed" });
    }
    console.log("batm4");
    refundSuccessful = true;

    // Update statuses only if refund is successful
    await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refunded" }
    );
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "refunded" });

    const adminEmail = "majesticescape.in@gmail.com";
    await sendEmail(userEmail, 11, params);
    // await sendEmail(adminEmail, 16, params);
    await sendEmail(hostEmail, 17, params);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.cancelAdminBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log("testc", bookingId);
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
    });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const data = await Booking.findById(bookingId).populate("userId hostId");
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "User data not found" });
    }
    const userName = data?.userId?.firstName + " " + data?.userId?.lastName;
    const hostName = data?.hostId?.firstName + " " + data?.hostId?.lastName;

    const instance = new Razorpay({ key_id: key, key_secret: secret });
    let refundSuccessful = false;

    const paymentData = await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refund initiated" },
      { new: true }
    );
    console.log("batm1");
    const payment = await Payment.findOne({ bookingId: bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment refund initiation failed",
      });
    }
    console.log("batm2");
    const refund = await instance.payments.refund(payment.paymentId, {
      amount: payment.amount,
      speed: "normal",
      notes: { notes_key_1: "Full Refund" },
      receipt: `Refund No. ${bookingId}`,
    });
    console.log("batm3");
    if (!refund) {
      return res
        .status(404)
        .json({ success: false, message: "Payment refund failed" });
    }
    console.log("batm4");
    refundSuccessful = true;

    // Update statuses only if refund is successful
    await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refunded" }
    );
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "refunded" });
    const params = { userName: userName, hostName: hostName };

    const userEmail = data?.userId?.email;
    const hostEmail = data?.hostId?.email;
    const adminEmail = "majesticescape.in@gmail.com";
    await sendEmail(userEmail, 32, params);
    // await sendEmail(adminEmail, 31, params);
    await sendEmail(hostEmail, 33, params);
    res.status(200).json({
      success: true,
      message: refundSuccessful
        ? "Refund issued and booking terminated"
        : "Booking cancelled without refund",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.checkDates = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const bookings = await Booking.find({
      propertyId,
      checkIn: { $gte: today }, // only future or today’s checkIn
      status: { $nin: ["rejected", "cancelled"] }, // exclude rejected & cancelled
    });

    const todayBooking = [];
    const datesArray = [];

    blockedDates(bookings, datesArray, todayBooking, today);

    console.log("final output", datesArray);
    res.json({ success: true, data: datesArray, today: todayBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.blockedDates = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const bookings = await Booking.find({
      propertyId,
      checkIn: { $gte: today }, // only future or today’s checkIn
      status: { $nin: ["rejected", "cancelled"] }, // exclude rejected & cancelled
      action: "user",
    });
    const manualBlock = await Booking.find({
      propertyId,
      checkIn: { $gte: today }, // only future or today’s checkIn
      status: { $nin: ["rejected", "cancelled"] }, // exclude rejected & cancelled
      action: "host",
    });
    const todayBooking = [];
    const datesArray = [];

    const todayHostBooking = [];
    const datesHostArray = [];
    blockedDates(bookings, datesArray, todayBooking, today);
    blockedDates(manualBlock, datesHostArray, todayHostBooking, today);

    res.json({
      success: true,
      data: datesArray,
      today: todayBooking,
      blocked: datesHostArray,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//host side unblocking dates that host blocked
exports.unblockDates = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { selectedDate } = req.body;
    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0); // normalize to midnight
    console.log("unblock1", propertyId, selectedDate);
    const booking = await Booking.findOne({
      propertyId,
      source: "local",
      checkIn: { $lte: today }, // only future or today’s checkIn
      checkOut: { $gt: today },
      status: { $nin: ["rejected", "cancelled"] }, // exclude rejected & cancelled
      action: "host",
    }).lean();
    console.log("unblock2", booking);
    const unblock = await Booking.findByIdAndUpdate(
      booking._id,
      { status: "cancelled" },
      { new: true }
    );
    console.log("unblock3", unblock);
    res.json({
      success: true,
      data: unblock,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// exports.checkDates = async (req, res) => {
//   try {
//     const { propertyId } = req.params;

//     const date = new Date();
//     date.setHours(0, 0, 0, 0); // normalize to midnight

//     const bookings = await Booking.find({
//       propertyId,
//       checkIn: { $gte: date }, // only future or today’s checkIn
//       status: { $nin: ["rejected", "cancelled"] }, // exclude rejected & cancelled
//     });

//     const todayBooking = [];
//     const datesArray = [];

//     const todayDate = new Date();
//     const today = new Date(todayDate.toLocaleDateString());

//     // const unavailableDates = await getUnavailableDates(propertyId);
//     for (const i of bookings) {
//       const checkIn = new Date(bookings[i].checkIn);
//       const checkOut = new Date(bookings[i].checkOut);
//       if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
//         return; // Skip invalid dates
//       }

//       const currentDate = new Date(checkIn);
//       console.log("haya", currentDate, checkOut);
//       while (currentDate <= checkOut && checkIn >= today) {
//         const formattedDate = currentDate.toISOString().split("T")[0]; // Alternative method
//         if (
//           currentDate.toISOString().split("T")[0] !==
//           checkOut.toISOString().split("T")[0]
//         ) {
//           datesArray.push(formattedDate);
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//       }

//       const newdate = new Date(checkIn.toLocaleDateString())
//         .toISOString()
//         .split("T")[0];

//       if (newdate == today.toISOString().split("T")[0]) {
//         const next = new Date(checkOut);
//         if (!todayBooking.includes(next)) {
//           todayBooking.push(next.setDate(next.getDate() + 1));
//         }
//       }
//     }

//     console.log("final outpu", datesArray);
//     res.json({ success: true, data: datesArray, today: todayBooking });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

//Cancel a booking (host)
exports.terminateBooking = async (req, res) => {
  try {
    const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
    });
    const params = { userName: userName, hostName: hostName };
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const instance = new Razorpay({ key_id: key, key_secret: secret });
    let refundSuccessful = false;

    const paymentData = await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refund initiated" },
      { new: true }
    );
    console.log("batm1");
    const payment = await Payment.findOne({ bookingId: bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment refund initiation failed",
      });
    }
    console.log("batm2");
    const refund = await instance.payments.refund(payment.paymentId, {
      amount: payment.amount,
      speed: "normal",
      notes: { notes_key_1: "Full Refund" },
      receipt: `Refund No. ${bookingId}`,
    });
    console.log("batm3");
    if (!refund) {
      return res
        .status(404)
        .json({ success: false, message: "Payment refund failed" });
    }
    console.log("batm4");
    refundSuccessful = true;

    // Update statuses only if refund is successful
    await Payment.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "refunded" }
    );
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "refunded" });
    const adminEmail = "majesticescape.in@gmail.com";

    await sendEmail(userEmail, 13, params);
    await sendEmail(hostEmail, 14, params);
    // await sendEmail(adminEmail, 15, params);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

//Cancel a booking (user)
// exports.terminateUserBooking = async (req, res) => {
//   try {
//     const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;

//     const booking = await Booking.findByIdAndUpdate(bookingId, {
//       status: "cancelled",
//     });
//     if (!booking) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found" });
//     }

//     const bookingData = await Booking.findById(bookingId);
//     if (!bookingData) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Check Out date not found" });
//     }
//     console.log("get date", bookingData.checkOut);
//     const futureDate = new Date(bookingData.checkOut);
//     const date1 = new Date();
//     const differenceInSeconds = (futureDate - date1) / 1000;

//     async function execute() {
//       console.log("reached ex");
//       const ObjectId = require("mongoose").Types.ObjectId;
//       const id = new ObjectId(`${bookingId}`);

//       const paymentStatus = await Payment.findOneAndUpdate(
//         { bookingId: id },
//         { status: "refund initiated" },
//         { new: true }
//       );
//       if (!paymentStatus) {
//         return res.status(404).json({
//           success: false,
//           message: "Payment refund initiation failed",
//         });
//       }

//       const instance = new Razorpay({ key_id: key, key_secret: secret });
//       const paymentData = await Payment.findOne({ bookingId: id });
//       const refund = await instance.payments.refund(paymentData.paymentId, {
//         amount: paymentData.amount,
//         speed: "normal",
//         notes: {
//           notes_key_1: "Full Refund",
//         },
//         receipt: `Refund No. ${bookingId}`,
//       });

//       return refund;
//     }
//     if (
//       bookingData.cancellationPolicy == "moderate" &&
//       differenceInSeconds >= moderate
//     ) {
//       const checkTransaction = await execute();
//       if (!checkTransaction) {
//         return;
//       }
//     }

//     if (
//       bookingData.cancellationPolicy == "flexible" &&
//       differenceInSeconds >= flexible
//     ) {
//       console.log("now ex", differenceInSeconds);
//       execute();
//     }

//     const ObjectId = require("mongoose").Types.ObjectId;
//     const id = new ObjectId(`${bookingId}`);
//     const updatePaymentData = await Payment.findOneAndUpdate(
//       { bookingId: id },
//       { status: "refunded" }
//     );
//     const updateBookingData = await Booking.findByIdAndUpdate(bookingId, {
//       status: "refunded",
//     });
//     const params = { userName: userName, hostName: hostName };

//     const adminEmail = "majesticescape.in@gmail.com";

//     await sendEmail(userEmail, 22, params);
//     await sendEmail(hostEmail, 20, params);
//     // await sendEmail(adminEmail, 21, params);

//     res.status(200).json({
//       success: true,
//       paymentData: updatePaymentData,
//       bookingData: updateBookingData,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };
exports.terminateUserBooking = async (req, res) => {
  try {
    const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    const id = new ObjectId(`${bookingId}`);

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
    });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const bookingData = await Booking.findById(bookingId);
    if (!bookingData) {
      return res
        .status(404)
        .json({ success: false, message: "Check Out date not found" });
    }

    const futureDate = new Date(bookingData?.checkIn);
    const now = new Date();
    const differenceInSeconds = (futureDate - now) / 1000;

    const instance = new Razorpay({ key_id: key, key_secret: secret });

    let refundSuccessful = false;

    if (
      (bookingData.cancellationPolicy === "moderate" &&
        differenceInSeconds >= moderate) ||
      (bookingData.cancellationPolicy === "flexible" &&
        differenceInSeconds >= flexible)
    ) {
      const paymentData = await Payment.findOneAndUpdate(
        { bookingId: id },
        { status: "refund initiated" },
        { new: true }
      );
      const payment = await Payment.findOne({ bookingId: id });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment refund initiation failed",
        });
      }

      const refund = await instance.payments.refund(payment.paymentId, {
        amount: payment.amount,
        speed: "normal",
        notes: { notes_key_1: "Full Refund" },
        receipt: `Refund No. ${bookingId}`,
      });

      if (!refund) {
        return res
          .status(404)
          .json({ success: false, message: "Payment refund failed" });
      }

      refundSuccessful = true;

      // Update statuses only if refund is successful
      await Payment.findOneAndUpdate({ bookingId: id }, { status: "refunded" });
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "refunded" });
    }

    // Email Notifications
    const params = { userName, hostName };
    await sendEmail(userEmail, 22, params);
    await sendEmail(hostEmail, 20, params);

    res.status(200).json({
      success: true,
      message: refundSuccessful
        ? "Refund issued and booking terminated"
        : "Booking cancelled without refund",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.terminateNonUserBooking = async (req, res) => {
  try {
    const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    const id = new ObjectId(`${bookingId}`);

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
    });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const bookingData = await Booking.findById(bookingId);
    if (!bookingData) {
      return res
        .status(404)
        .json({ success: false, message: "Check Out date not found" });
    }

    const futureDate = new Date(bookingData?.checkIn);
    const now = new Date();
    const differenceInSeconds = (futureDate - now) / 1000;

    const instance = new Razorpay({ key_id: key, key_secret: secret });

    let refundSuccessful = false;

    if (
      (bookingData.cancellationPolicy === "moderate" &&
        differenceInSeconds >= moderate) ||
      (bookingData.cancellationPolicy === "flexible" &&
        differenceInSeconds >= flexible)
    ) {
      const paymentData = await Payment.findOneAndUpdate(
        { bookingId: id },
        { status: "refund initiated" },
        { new: true }
      );
      const payment = await Payment.findOne({ bookingId: id });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment refund initiation failed",
        });
      }

      const refund = await instance.payments.refund(payment.paymentId, {
        amount: payment.amount,
        speed: "normal",
        notes: { notes_key_1: "Full Refund" },
        receipt: `Refund No. ${bookingId}`,
      });

      if (!refund) {
        return res
          .status(404)
          .json({ success: false, message: "Payment refund failed" });
      }

      refundSuccessful = true;

      // Update statuses only if refund is successful
      await Payment.findOneAndUpdate({ bookingId: id }, { status: "refunded" });
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "refunded" });
    }

    // Email Notifications
    const params = { userName, hostName };
    await sendEmail(userEmail, 22, params);
    await sendEmail(hostEmail, 20, params);

    res.status(200).json({
      success: true,
      message: refundSuccessful
        ? "Refund issued and booking terminated"
        : "Booking cancelled without refund",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Confirm a booking
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId, userEmail, hostEmail, userName, hostName } = req.body;

    // const generateToken = (payload) => {
    //   return jwt.sign({ bookingId: payload }, process.env.JWT_SECRET, {
    //     expiresIn: TOKEN_EXPIRATION,
    //   }); // expires in 14 days
    // };
    // const token = generateToken(bookingId);
    // if (!token) {
    //   throw new error("Unsucessful token");
    // }

    // const confirmationUrl = `${baseUrl}/rating?token=${token}&booking=${bookingId}`;
    // // const params = { userFirstName: "abc", url: confirmationUrl };
    // const agenda = new Agenda({ db: { address: mongoConnectionString } });
    // agenda.define("sendReviewEmail", async (job, done) => {
    //   await sendEmail(userEmail, 12, params);
    //   done();
    // });
    // function findSecondsDifference(date1, date2) {
    //   const oneSecond_ms = 1000;
    //   const date1_ms = date1.getTime();
    //   const date2_ms = date2.getTime();
    //   const delay = 5 * 60 * 60 * 1000;
    //   const difference_ms = date2_ms - date1_ms + delay;
    //   return Math.round(difference_ms / oneSecond_ms);
    // }

    // const checkOutBooking = await Booking.findById(bookingId);

    // const futureDate = new Date(checkOutBooking.checkOut);

    // await booking.save();
    // await sendOTPEmail(recipient, firstName, otp);

    // var secsFromNow = findSecondsDifference(new Date(), futureDate);
    const params = { userName: userName, hostName: hostName };
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "confirmed",
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    const adminEmail = "majesticescape.in@gmail.com";

    await sendEmail(userEmail, 10, params);
    await sendEmail(hostEmail, 19, params);
    // await sendEmail(adminEmail, 18, params);
    // (async function () {
    //   try {
    //     await agenda.start();
    //     await agenda.schedule("in 2 minutes", "sendReviewEmail");
    //     // agenda.schedule(secsFromNow + " seconds", "sendReviewEmail");
    //   } catch (err) {
    //     console.error("Agenda start failed:", err.message);
    //   }
    // })();
    res.status(200).json({ success: true });
    //  res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.confirmInstantBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.body;

    // const generateToken = (payload) => {
    //   return jwt.sign({ bookingId: payload }, process.env.JWT_SECRET, {
    //     expiresIn: TOKEN_EXPIRATION,
    //   }); // expires in 14 days
    // };
    // const token = generateToken(bookingId);
    // if (!token) {
    //   throw new error("Unsucessful token");
    // }

    // const confirmationUrl = `${baseUrl}/rating?token=${token}&booking=${bookingId}`;
    // // const params = { userFirstName: "abc", url: confirmationUrl };
    // const agenda = new Agenda({ db: { address: mongoConnectionString } });
    // agenda.define("sendReviewEmail", async (job, done) => {
    //   await sendEmail(userEmail, 12, params);
    //   done();
    // });
    // function findSecondsDifference(date1, date2) {
    //   const oneSecond_ms = 1000;
    //   const date1_ms = date1.getTime();
    //   const date2_ms = date2.getTime();
    //   const delay = 5 * 60 * 60 * 1000;
    //   const difference_ms = date2_ms - date1_ms + delay;
    //   return Math.round(difference_ms / oneSecond_ms);
    // }

    // const checkOutBooking = await Booking.findById(bookingId);

    // const futureDate = new Date(checkOutBooking.checkOut);

    // await booking.save();
    // await sendOTPEmail(recipient, firstName, otp);

    // var secsFromNow = findSecondsDifference(new Date(), futureDate);
    const params = { userFirstName: "xyz" };
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "confirmed",
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    const host = await Booking.findById(bookingId).populate(
      "hostId propertyId"
    );
    const hostEmail = host.hostId.email;
    const data = await User.findById(userId);
    const userEmail = await data.email;

    const adminEmail = "majesticescape.in@gmail.com";

    // await sendEmail(userEmail, 35, params);
    // await sendEmail(hostEmail, 34, params);
    // await sendEmail(adminEmail, 36, params);
    // (async function () {
    //   try {
    //     await agenda.start();
    //     await agenda.schedule("in 2 minutes", "sendReviewEmail");
    //     // agenda.schedule(secsFromNow + " seconds", "sendReviewEmail");
    //   } catch (err) {
    //     console.error("Agenda start failed:", err.message);
    //   }
    // })();
    res.status(200).json({ success: true });
    //  res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// Mark booking as paid
exports.markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId, hostEmail, userId, manual } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const data = await User.findById(userId);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const userEmail = await data.email;

    const adminEmail = "majesticescape.in@gmail.com";

    if (manual) {
      await sendEmail(hostEmail, 8);

      // await sendEmail("majesticescape.in@gmail.com", 9);
      return res.status(200).json({ success: true, data: booking });
    }

    await sendEmail(userEmail, 35);
    await sendEmail(hostEmail, 34);
    // await sendEmail(adminEmail, 36);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Utility to calculate refund (add your logic here)
const calculateRefund = (booking) => {
  // Example logic: Partial refund based on cancellation policy
  const now = new Date();
  if (booking.cancellationPolicy === "strict") return 0;
  if (booking.cancellationPolicy === "moderate") return booking.price * 0.5;
  if (booking.cancellationPolicy === "flexible") return booking.price * 0.75;
  return 0;
};

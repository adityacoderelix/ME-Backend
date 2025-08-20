const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const ListingProperty = require("../models/ListingProperty");
const Users = require("../models/User");
const Agenda = require("agenda");
const { sendEmail } = require("../utils/sendEmail");
const User = require("../models/User");
const Razorpay = require("razorpay");
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
    const booking = new Booking(req.body);

    await booking.save();
    const { propertyId } = req.body;
    // const host = await ListingProperty.findById(propertyId);
    // console.log(host._id.toString());
    // booking.hostId = host._id.toString();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all bookings (admin or host-specific)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all filtered bookings (host-specific)
exports.getAllFilterBookings = async (req, res) => {
  try {
    const { search, status, from, to } = req.query;
    console.log("daysof", search, status, from, to);
    const bookings = await Booking.find()
      .populate("userId propertyId hostId")
      .sort({ createdAt: -1 });

    // function filter(users) {
    //   const data = users.filter((booking) =>
    //     status != "all"
    //       ? (booking.userId?.firstName
    //           ?.toLowerCase()
    //           .includes(search.toLowerCase()) ||
    //           booking.userId?.lastName
    //             ?.toLowerCase()
    //             .includes(search.toLowerCase()) ||
    //           (booking.userId?.firstName + " " + booking.userId?.lastName)
    //             .toLowerCase()
    //             .includes(search.toLowerCase()) ||
    //           booking.propertyId?.title
    //             ?.toLowerCase()
    //             .includes(search.toLowerCase())) &&
    //         new Date(booking.checkIn) >= new Date(from) &&
    //         new Date(booking.checkOut) <= new Date(to)
    //       : booking.userId?.firstName
    //           ?.toLowerCase()
    //           .includes(search.toLowerCase()) ||
    //         booking.userId?.lastName
    //           ?.toLowerCase()
    //           .includes(search.toLowerCase()) ||
    //         (booking.userId?.firstName + " " + booking.userId?.lastName)
    //           .toLowerCase()
    //           .includes(search.toLowerCase()) ||
    //         booking.propertyId?.title
    //           ?.toLowerCase()
    //           .includes(search.toLowerCase()) ||
    //         (new Date(booking.checkIn) >= new Date(from) &&
    //           booking.status.toLowerCase() == status.toLowerCase())
    //   );
    //   return data;
    // }
    function filter(users) {
      return users.filter((booking) => {
        const matchesSearch =
          booking.userId?.firstName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          booking.userId?.lastName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          (booking.userId?.firstName + " " + booking.userId?.lastName)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          booking.propertyId?.title
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchesDate =
          new Date(booking.checkIn) >= new Date(from) &&
          new Date(booking.checkOut) <= new Date(to);

        const matchesStatus =
          status.toLowerCase() === "all"
            ? "true"
            : booking.status?.toLowerCase() === status.toLowerCase();

        return matchesSearch && matchesDate && matchesStatus;
      });
    }

    const final = filter(bookings);
    res.json({ success: true, data: final });

    // const bookings = await Booking.find().populate("userId propertyId hostId");
    // res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId propertyId hostId");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific user
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate(
      "propertyId hostId"
    );
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific host
exports.getBookingsByHost = async (req, res) => {
  try {
    const bookings = await Booking.find({ hostId: req.params.hostId }).populate(
      "userId propertyId"
    );
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
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

    const adminEmail = "majesticescape.in@gmail.com";
    await sendEmail(userEmail, 11, params);
    // await sendEmail(adminEmail, 16, params);
    await sendEmail(hostEmail, 17, params);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

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

    const data = await User.findById(userId);
    const userEmail = await data.email;
    await sendEmail(userEmail, 10, params);

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
    const { bookingId, hostEmail, userId } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // await sendEmail("majesticescape.in@gmail.com", 9);
    await sendEmail(hostEmail, 8);
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

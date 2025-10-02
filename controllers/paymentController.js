// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { parseMDYToUTC } = require("../utils/convertDate");
const razorpay = new Razorpay({
  key_id: "rzp_test_w0bKE5w5UPOPrY",
  key_secret: "iYRZ22GvJhYb5ryCmhAc6wig",
});
// helper: parse "MM/DD/YYYY" or "M/D/YYYY"

// Usage in your route:

exports.fetch = async (req, res) => {
  try {
    const { paymentType, search, searchList, from, to } = req.query;
    const date = parseMDYToUTC(from, to);

    console.log(date.from, date.to);

    const filter = {};
    if (paymentType && paymentType != "all") {
      filter.paymentType = paymentType;
    }

    if (from && !to) {
      // only from date given
      filter.createdAt = { $gte: date.from };
    } else if (from && to) {
      // both from and to date given
      filter.createdAt = {
        $gte: date.from,
        $lte: date.to,
      };
    }

    let data;
    if (!searchList) {
      data = await Payment.find(filter).populate("propertyId");
    }
    if (searchList) {
      if (searchList == "date-desc") {
        data = await Payment.find(filter)
          .populate("propertyId")
          .sort({ createdAt: -1 });
      } else if (searchList == "date-asc") {
        data = await Payment.find(filter)
          .populate("propertyId")
          .sort({ createdAt: 1 });
      } else if (searchList == "amount-desc") {
        data = await Payment.find(filter)
          .populate("propertyId")
          .sort({ amount: -1 });
      } else {
        data = await Payment.find(filter)
          .populate("propertyId")
          .sort({ amount: 1 });
      }
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Payment data not available",
      });
    }
    if (search) {
      data = data.filter(
        (b) =>
          b.propertyId.title.toLowerCase().includes(search.toLowerCase()) ||
          b.paymentId.toLowerCase().includes(search.toLowerCase()) ||
          b.customerDetails.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};
// Create a new order

exports.createOrder = async (req, res) => {
  try {
    const { bookingId, userId, currency, amount, propertyId } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Amount must be at least 100 paisa (₹1)",
      });
    }

    //Find User Details
    const user = await User.findById(userId);
    const ObjectId = require("mongoose").Types.ObjectId;

    console.log("not nic", bookingId);

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    // Save order details to database
    const payment = new Payment({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: bookingId,
      propertyId: propertyId,
      customerDetails: {
        name: user.firstName + " " + user.lastName,
        email: user.email,
        contact: user.phoneNumber,
      },
      status: "created",
    });
    await payment.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};
// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (isAuthentic) {
      // Update payment details in database
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          paymentMethod: payment?.method,
          status: "paid",
        }
      );

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" }
      );

      res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
};
// Get payment details
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      $or: [{ paymentId: req.params.id }, { orderId: req.params.id }],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment details",
    });
  }
};

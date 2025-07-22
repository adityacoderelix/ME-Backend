// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");
const razorpay = new Razorpay({
  key_id: "rzp_test_w0bKE5w5UPOPrY",
  key_secret: "iYRZ22GvJhYb5ryCmhAc6wig",
});
// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, currency, amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Amount must be at least 100 paisa (₹1)",
      });
    }

    //Find User Details
    const user = await User.findById(userId);

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment details in database
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
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

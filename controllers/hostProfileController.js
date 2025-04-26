// controllers/hostProfileController.js
const User = require('../models/User');
const generateOTP = require('../utils/sendOtpUtils'); // Utility function to generate OTP

exports.sendOtp = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isLocked()) {
      return res.status(403).json({ message: 'Too many OTP attempts. Please try again later.' });
    }

    const otp = generateOTP();
    user.otp = {
      value: otp,
      expiry: Date.now() + 10 * 60 * 1000 // OTP valid for 10 minutes
    };
    user.otpRetries = 0;

    await user.save();

    // Send OTP to user via email/SMS (not implemented here)
    return res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, firstName, lastName, bio } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isLocked()) {
      return res.status(403).json({ message: 'Too many OTP attempts. Please try again later.' });
    }

    if (!user.otp || user.otp.value !== otp || user.otp.expiry < Date.now()) {
      user.otpRetries += 1;

      if (user.otpRetries >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Reset OTP-related fields
    user.otp = null;
    user.otpRetries = 0;
    user.lockUntil = null;

    // Update user role and additional fields
    user.role = 'host'; // Update role to host
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.bio = bio || user.bio;

    await user.save();

    return res.status(200).json({ message: 'Host profile created successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// userService.js
const User = require('../models/User');
const { generateOtp, sendGuestLoginOtpEmail } = require('../utils/sendOtpUtils');

/**
 * Service to handle OTP logic
 */
exports.loginOtpService = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return { status: 404, message: 'User not found.' };
  }

  // Check if user is banned or deactivated
  if (!user.status.active) {
    const reason = user.status.banned ? user.status.bannedReason || 'User is banned' : 'User is deactivated';
    return { status: 403, message: reason };
  }

  // Check if user is locked
  if (user.isLocked()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000); // Time in seconds
    return { status: 423, message: `Account is locked. Try again in ${remainingTime} seconds.` };
  }

  // Check OTP retries within 5 minutes
  if (user.otpRetries >= 5) {
    // Lock the user for 15 minutes
    const lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.lockUntil = new Date(lockUntil);
    user.otpRetries = 0; // Reset retries after locking
    await user.save();

    return { status: 429, message: 'Too many OTP attempts. Account locked for 15 minutes.' };
  }

  // Generate OTP
  const otp = generateOtp();

  // Send OTP email
  await sendGuestLoginOtpEmail(user.email, user.firstName, otp);

  // Store OTP and update retry count
  user.otp = {
    value: otp,
    expiry: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
  };
  user.otpRetries += 1;
  await user.save();

  return { status: 200, message: 'OTP sent successfully.' };
};

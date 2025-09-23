const User = require("../models/User");

// Get user information by ID
exports.getGuests = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getGuestsById = async (req, res) => {
  try {
    const { userId } = req.query;
    const users = await User.findById(userId); // Fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user information by ID
exports.getUserInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .select("-otp.value -otp.expiry -lockUntil") // Exclude sensitive fields
      .lean(); // Optimize for read-only

    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User information retrieved successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching user information", details: err.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting user", details: err.message });
  }
};

// Deactivate/Ban a user by ID
exports.banUser = async (req, res) => {
  const { userId } = req.params;
  const { bannedReason } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.status.active = false;
    user.status.banned = true;
    user.status.bannedReason = bannedReason || "No reason provided";

    await user.save();

    res.status(200).json({ message: "User banned successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Error banning user", details: err.message });
  }
};

// Unban a user by ID
exports.unbanUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.status.active = true;
    user.status.banned = false;
    user.status.bannedReason = null;

    await user.save();

    res.status(200).json({ message: "User unbanned successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error unbanning user", details: err.message });
  }
};

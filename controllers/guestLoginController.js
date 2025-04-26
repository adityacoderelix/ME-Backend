
// userController.js
const userService = require('../services/userService');

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const response = await userService.handleSendOtp(email);
        res.status(response.status).json({ message: response.message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred.' });
    }
};
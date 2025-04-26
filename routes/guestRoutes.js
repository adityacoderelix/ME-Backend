const express = require('express');
const router = express.Router();
const {getUserInfo,
    deleteUser,
    banUser,
    unbanUser,
    getGuests
 } = require('../controllers/guestController');

 router.get('/', getGuests)
// Get user information
router.get('/info/:userId', getUserInfo);

// Delete user
router.delete('/delete/:userId', deleteUser);

// Ban user
router.patch('/ban/:userId', banUser);

// Unban user
router.patch('/unban/:userId', unbanUser);

module.exports = router;

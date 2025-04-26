const Calendar = require('../models/calendarModel');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');

// Get availability for an experience
exports.getAvailability = async (req, res) => {
  const { experienceId } = req.params;
  try {
    const calendar = await Calendar.findOne({ experienceId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found for this experience' });
    }
    res.status(200).json({ availability: calendar.dates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error });
  }
};

// Block a specific date for an experience
exports.blockDate = async (req, res) => {
  const { experienceId } = req.params;
  const { date } = req.body;
  try {
    const calendar = await Calendar.findOne({ experienceId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found for this experience' });
    }
    
    const dateToBlock = calendar.dates.find(d => d.date.toISOString().split('T')[0] === date);
    if (!dateToBlock) {
      return res.status(404).json({ message: 'Date not found in calendar' });
    }

    dateToBlock.blocked = true;
    await calendar.save();
    
    res.status(200).json({ message: 'Date blocked successfully', calendar });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking date', error });
  }
};

// Mark a date as unavailable (due to reservation or other reasons)
exports.markDateUnavailable = async (req, res) => {
  const { experienceId } = req.params;
  const { date } = req.body;
  try {
    const calendar = await Calendar.findOne({ experienceId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found for this experience' });
    }

    const dateToMark = calendar.dates.find(d => d.date.toISOString().split('T')[0] === date);
    if (!dateToMark) {
      return res.status(404).json({ message: 'Date not found in calendar' });
    }

    dateToMark.available = false;
    dateToMark.reservationStatus = 'unavailable';
    await calendar.save();

    res.status(200).json({ message: 'Date marked as unavailable', calendar });
  } catch (error) {
    res.status(500).json({ message: 'Error marking date as unavailable', error });
  }
};

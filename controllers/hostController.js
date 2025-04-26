const Host = require('../models/hostModel');
const Property = require('../models/propertyModel');

// Get all hosts and their properties
exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await Host.find().populate('properties');
    res.status(200).json({ hosts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hosts', error });
  }
};

// Get a single host and their properties
exports.getHostById = async (req, res) => {
  const { hostId } = req.params;
  try {
    const host = await Host.findById(hostId).populate('properties');
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.status(200).json({ host });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host', error });
  }
};

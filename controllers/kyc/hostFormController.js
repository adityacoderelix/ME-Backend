const axios = require("axios");
const KycLogs = require("../../models/KycLogs");
const kycHostForm = require("../../models/KycHostForm");
const User = require("../../models/User");
const mongoose = require("mongoose");
require("dotenv").config();

exports.createhostKycForm = async (req, res) => {
  try {
    console.log("enterd create host");
    const kyc = new kycHostForm(req.body);
    await kyc.save();
    res.status(200).json({ success: true, data: kyc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updatehostKycForm = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await kycHostForm.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized to update" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updatehostKycFormStatus = async (req, res) => {
  try {
    const { userId, isVerified, documentType } = req.body;
    console.log("robin");
    const response = await kycHostForm.findOneAndUpdate(
      { hostId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          "documentInfo.isVerified": isVerified,
          "documentInfo.documentType": documentType,
        },
      }
    );
    console.log("nightwin", response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updatehostKycFormGstStatus = async (req, res) => {
  try {
    const { userId, panNumber, gstNumber, isVerified } = req.body;

    const response = await kycHostForm.findOneAndUpdate(
      { hostId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          "gstInfo.panNumber": panNumber,
          "gstInfo.gstNumber": gstNumber,
          "gstInfo.isVerified": isVerified,
        },
      }
    );
    console.log("nightwin", response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.fetchhostKycForm = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await kycHostForm.findOne({
      hostId: new mongoose.Types.ObjectId(id),
    });

    if (!data) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized to update" });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.fetchhostKycFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await kycHostForm.findById(id);

    if (!data) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized to update" });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.fetchhostKycFormByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await kycHostForm.findOne({
      hostId: new mongoose.Types.ObjectId(id),
    });

    if (!data) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized to update" });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const mongoose = require('mongoose');

const propertyRegistrationNoSchema = new mongoose.Schema({
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  area: { type: String, required: true },
  registrationNo: { type: String, required: true, unique: true },
  propertyName: { type: String, required: true },
  noOfRooms: { type: String, required: true }
});

module.exports = mongoose.model('PropertyRegistrationNo', propertyRegistrationNoSchema);

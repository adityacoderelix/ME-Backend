// const Booking = require("../models/Booking");

// // Utility function: get all unavailable dates for a property
// async function getUnavailableDates(propertyId) {
//   const today = new Date();

//   // Fetch only upcoming bookings
//   const bookings = await Booking.find({
//     propertyId,
//     checkIn: { $gte: today }, // future check-ins
//   }).select("checkIn");

//   // Return array of check-in dates
//   return bookings.map((b) => b.checkIn.toISOString().split("T")[0]); // YYYY-MM-DD
// }

// module.exports = getUnavailableDates;

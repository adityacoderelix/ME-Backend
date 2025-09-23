exports.blockedDates = async (bookings, datesArray, todayBooking, today) => {
  for (const booking of bookings) {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      continue; // skip invalid
    }

    const currentDate = new Date(checkIn);

    while (currentDate <= checkOut && checkIn >= today) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      if (formattedDate !== checkOut.toISOString().split("T")[0]) {
        if (!datesArray.includes(formattedDate)) {
          datesArray.push(formattedDate);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Special case: if booking starts today
    const newdate = checkIn.toISOString().split("T")[0];
    if (newdate === today.toISOString().split("T")[0]) {
      const next = new Date(checkOut);
      next.setDate(next.getDate() + 1);
      const formattedNext = next.toISOString().split("T")[0];
      if (!todayBooking.includes(formattedNext)) {
        todayBooking.push(formattedNext);
      }
    }
  }
};

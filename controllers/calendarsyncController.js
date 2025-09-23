const ExternalCalendar = require("../models/ExternalCalendar");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const ical = require("node-ical");
const axios = require("axios");
const cron = require("node-cron");
const ListingProperty = require("../models/ListingProperty");

async function syncCalendars(hostId) {
  const calendars = await ExternalCalendar.find({ kind: "import" });
  for (const cal of calendars) {
    try {
      const headers = {};
      if (cal.etag) headers["If-None-Match"] = cal.etag;
      if (cal.lastModified)
        headers["If-Modified-Since"] = cal.lastModified.toUTCString();

      const resp = await axios.get(cal.url, {
        headers,
        responseType: "text",
        validateStatus: (s) => s === 200 || s === 304,
        timeout: 20000,
      });

      if (resp.status === 304) {
        // nothing changed
        console.log("Calendar not modified:", cal.url);
        continue;
      }

      // update etag/lastModified
      if (resp.headers.etag) cal.etag = resp.headers.etag;
      if (resp.headers["last-modified"])
        cal.lastModified = new Date(resp.headers["last-modified"]);
      cal.lastFetched = new Date();
      await cal.save();

      // parse ICS
      const data = resp.data;
      const parsed = ical.sync.parseICS(data);

      // collect UIDs seen
      const seenUIDs = [];

      for (const key in parsed) {
        const vevent = parsed[key];
        if (vevent.type !== "VEVENT") continue;

        const uid = vevent.uid || vevent.uid || vevent.uid;
        if (!uid) continue;

        seenUIDs.push(uid);

        // Node-ical gives start/end as Date if it can parse them
        let start = vevent.start;
        let end = vevent.end;

        // Normalize: if either is string or date, ensure Date objects
        start = new Date(start);
        end = new Date(end);

        // Convert to date-only if they are all-day events (optional)
        // Upsert booking by sourceId & propertyId
        const existing = await Booking.findOne({
          source: "ical",
          sourceId: uid,
          propertyId: cal.propertyId,
        });

        if (existing) {
          // Update if dates changed
          existing.checkIn = start;
          existing.checkOut = end;
          existing.price = existing.price ?? 0;
          existing.status = "confirmed";
          await existing.save();
        } else {
          // Create new imported booking -> block the dates
          const newB = new Booking({
            userId: hostId, // imported bookings may not have a user
            propertyId: cal.propertyId,
            hostId: hostId,
            checkIn: start,
            checkOut: end,
            price: 0,
            currency: "INR",
            status: "confirmed",
            paymentStatus: "unpaid",
            source: "ical",
            sourceId: uid,
            guests: 0,
          });
          await newB.save();
        }
      }

      // Remove bookings that were imported from this calendar but no longer present
      const importedBookings = await Booking.find({
        propertyId: cal.propertyId,
        source: "ical",
      });

      for (const b of importedBookings) {
        if (!seenUIDs.includes(b.sourceId)) {
          // either remove or mark as cancelled
          // await Booking.deleteOne({ _id: b._id });
          b.status = "cancelled";
          await b.save();
        }
      }
    } catch (err) {
      console.error("Failed to sync", cal.url, err.message || err);
    }
  } // for
}

exports.saveCalendarUrl = async (req, res) => {
  try {
    const { propertyId, url, kind = "import" } = req.body;

    const userData = await ListingProperty.findById(propertyId);

    let secret = null;
    if (kind === "export") {
      // generate a secret for public ICS endpoint
      secret = crypto.randomBytes(16).toString("hex");
    }
    const cal = new ExternalCalendar({
      propertyId,
      url,
      kind,
      secret,
    });
    const calSave = await cal.save();

    (async () => {
      await syncCalendars(userData.host);
      cron.schedule("*/5 * * * *", async () => {
        console.log("Running calendar sync...");
        await syncCalendars(userData.host);
      });
    })();

    res.json({ success: true, message: "Calendar imported", calendar: cal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportCalendar = async (req, res) => {
  try {
    const { secret } = req.params;
    const calEntry = await ExternalCalendar.findOne({ secret, kind: "export" });
    if (!calEntry) return res.status(404).send("Not found");

    // fetch bookings for property
    const bookings = await Booking.find({
      propertyId: calEntry.propertyId,
      // include local and maybe imported bookings if desired
      // decide what bookings you want to export (e.g. all confirmed/unavailable)
    });

    const domain = process.env.PUBLIC_HOSTNAME || "yourdomain.com"; // used for UID
    const calendar = ical({ domain, name: "My App Calendar" });

    bookings.forEach((b) => {
      // choose UID pattern that distinguishes exported events from imported ones
      const uid = `${b._id}@${domain}`;

      calendar.createEvent({
        start: b.checkIn,
        end: b.checkOut,
        summary: b.title || `Blocked`,
        uid,
        description: b._id.toString(),
        allDay: false, // set to true if your checkIn/checkOut are whole-day events
      });
    });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    calendar.serve(res); // ical-generator will pipe calendar text to response
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

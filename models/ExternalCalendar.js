// models/ExternalCalendar.js
const mongoose = require("mongoose");

const externalCalendarSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ListingProperty",
    required: true,
  },
  url: { type: String }, // remote ICS URL (Airbnb export)
  kind: { type: String, enum: ["import", "export"], default: "import" }, // import = fetch this URL, export = we serve ICS at secret URL
  secret: { type: String }, // for export: secret token used in public ICS URL
  etag: { type: String }, // optional ETag of last fetch
  lastModified: { type: Date }, // last-modified header
  lastFetched: { type: Date },
});

module.exports = mongoose.model("ExternalCalendar", externalCalendarSchema);

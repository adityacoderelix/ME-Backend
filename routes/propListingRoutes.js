const express = require("express");
const router = express.Router();
const {
  getAllPListings,
  getUserPListingById,
  createPListing,
  updatePListing,
  deletePListing,
  bulkActionPListings,
  exportPListings,
  getListingStatus
} = require("../controllers/PropListingController");

router.get("/", getAllPListings);
router.get('/status', getListingStatus);

router.get("/export", exportPListings);
router.get("/:id", getUserPListingById);
router.post("/", createPListing);
router.put("/:id", updatePListing);
router.delete("/:id", deletePListing);
router.post("/bulk-action", bulkActionPListings);

module.exports = router;

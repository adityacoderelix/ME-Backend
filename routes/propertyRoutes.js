// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/", propertyController.getAllProperties);
router.get("/static", propertyController.getAllStaticProperties);
router.get("/dynamic", propertyController.getAllStays);

router.get("/:id", propertyController.getPropertyById);
router.post("/", propertyController.createProperty);
router.put("/:id", propertyController.updateProperty);

router.get(
  "/admin/processing-listings",
  propertyController.getProcessingListingsForAdmin
);
router.get(
  "/admin/filtered-listings",
  propertyController.getFilteredListingsForAdmin
);
// PUT approve a listing
router.put("/admin/approve/:id", propertyController.approveListing);
router.delete(
  "/user-property/:id",
  authMiddleware,
  propertyController.deleteProperty
);

router.post(
  "/create-listing-property",
  propertyController.createListingProperty
);

router.put(
  "/update-listing-property/:id",
  propertyController.updateListingProperty
);
router.get(
  "/user-properties/:userEmail",
  authMiddleware,
  propertyController.getUserPropertyListings
);

router.post("/timings", propertyController.timing);
module.exports = router;

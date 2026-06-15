const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
} = require("../controllers/reviewController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", protect, addReview);

router.get("/:productId", getReviews);

module.exports = router;
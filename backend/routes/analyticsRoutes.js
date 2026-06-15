const express = require("express");
const router = express.Router();

const {
  analyticsOverview,
} = require("../controllers/analyticsController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.get(
  "/overview",
  protect,
  adminOnly,
  analyticsOverview
);

module.exports = router;
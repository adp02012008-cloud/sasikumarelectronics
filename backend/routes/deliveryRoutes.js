const express = require("express");

const router = express.Router();

const {
  createDeliverySetting,
  getDeliverySettings,
  calculateDeliveryCharge,
  deleteDeliverySetting,
} = require("../controllers/deliveryController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.get("/", getDeliverySettings);

router.get("/calculate", calculateDeliveryCharge);

router.post(
  "/",
  protect,
  adminOnly,
  createDeliverySetting
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteDeliverySetting
);

module.exports = router;
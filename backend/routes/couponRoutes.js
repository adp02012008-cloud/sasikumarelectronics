const express =
require("express");

const router =
express.Router();

const {
  createCoupon,
  getCoupons,
  applyCoupon
} =
require(
  "../controllers/couponController"
);

const {
  protect,
  adminOnly
} =
require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  protect,
  adminOnly,
  createCoupon
);

router.get(
  "/",
  protect,
  adminOnly,
  getCoupons
);

router.post(
  "/apply",
  applyCoupon
);

module.exports =
router;
const express =
  require("express");

const router =
  express.Router();

const {
  addWishlist,
  getWishlist,
  removeWishlist,
} = require(
  "../controllers/wishlistController"
);

router.post(
  "/add",
  addWishlist
);

router.get(
  "/:userId",
  getWishlist
);

router.delete(
  "/:userId/:productId",
  removeWishlist
);

module.exports =
  router;
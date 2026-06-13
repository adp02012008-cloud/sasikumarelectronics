const express =
  require("express");

const router =
  express.Router();

const {
  addToCart,
  getCart,
  removeItem,
  clearCart,
} = require(
  "../controllers/cartController"
);

router.post(
  "/add",
  addToCart
);

router.get(
  "/:userId",
  getCart
);

router.delete(
  "/:userId/:productId",
  removeItem
);

router.delete(
  "/clear/:userId",
  clearCart
);

module.exports = router;
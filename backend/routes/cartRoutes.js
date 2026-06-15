const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeItem,
  removeSelectedItems,
  clearCart,
} = require("../controllers/cartController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/add", protect, addToCart);

router.get("/", protect, getCart);

router.put("/update", protect, updateCartQuantity);

router.post("/remove-selected", protect, removeSelectedItems);

router.delete("/clear", protect, clearCart);

router.delete("/:productId", protect, removeItem);

module.exports = router;
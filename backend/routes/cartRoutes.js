const express = require("express");

const router = express.Router();

const {
 addToCart,
 getCart,
 removeItem,
 clearCart,
} = require("../controllers/cartController");

const {
 protect,
} = require("../middleware/authMiddleware");

router.post("/add", protect, addToCart);

router.get("/", protect, getCart);

router.delete("/clear", protect, clearCart);

router.delete("/:productId", protect, removeItem);

module.exports = router;
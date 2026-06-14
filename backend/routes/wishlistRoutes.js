const express = require("express");

const router = express.Router();

const {
 addWishlist,
 getWishlist,
 removeWishlist,
} = require("../controllers/wishlistController");

const {
 protect,
} = require("../middleware/authMiddleware");

router.post("/add", protect, addWishlist);

router.get("/", protect, getWishlist);

router.delete("/:productId", protect, removeWishlist);

module.exports = router;
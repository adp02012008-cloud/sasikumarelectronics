const express =
require("express");


const router =
express.Router();


const {
  saveSearch,
  trendingSearches,
  popularProducts,
} =
require(
  "../controllers/searchController"
);


const {
  protect
} =
require(
  "../middleware/authMiddleware"
);


router.post(
  "/save",
  protect,
  saveSearch
);


router.get(
  "/trending",
  trendingSearches
);


router.get(
  "/popular-products",
  popularProducts
);


module.exports =
router;
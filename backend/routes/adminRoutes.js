const express =
require("express");

const router =
express.Router();

const {
  dashboard,
  getUsers,
  deleteUser,
  lowStockProducts,
  monthlyRevenue,
  salesStats,
  revenueChart,
  topProducts,
  userGrowth,
} = require(
  "../controllers/adminController"
);


const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
);


/*
=========================
ADMIN DASHBOARD
=========================
*/

router.get(
  "/dashboard",
  protect,
  adminOnly,
  dashboard
);


/*
=========================
GET ALL USERS
=========================
*/

router.get(
  "/users",
  protect,
  adminOnly,
  getUsers
);


/*
=========================
DELETE USER
=========================
*/

router.delete(
  "/user/:id",
  protect,
  adminOnly,
  deleteUser
);


/*
=========================
LOW STOCK PRODUCTS
=========================
*/

router.get(
  "/low-stock",
  protect,
  adminOnly,
  lowStockProducts
);


/*
=========================
MONTHLY REVENUE
=========================
*/

router.get(
  "/monthly-revenue",
  protect,
  adminOnly,
  monthlyRevenue
);


/*
=========================
SALES STATS
=========================
*/

router.get(
  "/sales-stats",
  protect,
  adminOnly,
  salesStats
);


/*
=========================
REVENUE CHART
=========================
*/

router.get(
  "/revenue-chart",
  protect,
  adminOnly,
  revenueChart
);


/*
=========================
TOP PRODUCTS
=========================
*/

router.get(
  "/top-products",
  protect,
  adminOnly,
  topProducts
);


/*
=========================
USER GROWTH
=========================
*/

router.get(
  "/user-growth",
  protect,
  adminOnly,
  userGrowth
);


module.exports =
router;
const express = require("express");

const router = express.Router();

const {
 createOrder,
 getOrders,
 getMyOrders,
 getSingleOrder,
 downloadInvoice,
 updateOrderStatus,
} = require("../controllers/orderController");

const {
 protect,
 adminOnly,
} = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/invoice/:id", protect, downloadInvoice);

router.put("/status/:id", protect, adminOnly, updateOrderStatus);

router.get("/", protect, adminOnly, getOrders);

router.get("/:id", protect, getSingleOrder);

module.exports = router;
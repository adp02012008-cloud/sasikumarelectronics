const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  createProduct,
  getProducts,
  getProduct,
  searchProducts,
  searchSuggestions,
  filterCategory,
  updateProduct,
  deleteProduct,
  inventory,
  updateStock,
  recommendProducts,
} = require("../controllers/productController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProduct
);

router.get(
  "/admin/inventory",
  protect,
  adminOnly,
  inventory
);

router.put(
  "/admin/stock/:id",
  protect,
  adminOnly,
  updateStock
);

router.get("/recommend/:id", recommendProducts);

router.get("/search", searchProducts);

router.get("/suggestions", searchSuggestions);

router.get("/category/:category", filterCategory);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

module.exports = router;
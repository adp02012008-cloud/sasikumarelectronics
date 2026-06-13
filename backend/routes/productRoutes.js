const express =
require("express");

const router =
express.Router();


const upload =
require(
  "../middleware/upload"
);


const {

  createProduct,

  getProducts,

  getProduct,

  searchProducts,

  filterCategory,

  updateProduct,

  deleteProduct,

  inventory,

  updateStock,

  recommendProducts,

} = require(
  "../controllers/productController"
);


const {
  protect,
  adminOnly,
} =
require(
 "../middleware/authMiddleware"
);




/*
====================================
CREATE PRODUCT (ADMIN)
====================================
*/

router.post(

  "/",

  protect,

  adminOnly,

  upload.array(
    "images",
    5
  ),

  createProduct

);




/*
====================================
GET INVENTORY REPORT (ADMIN)
====================================
*/

router.get(

  "/admin/inventory",

  protect,

  adminOnly,

  inventory

);




/*
====================================
UPDATE STOCK (ADMIN)
====================================
*/

router.put(

  "/admin/stock/:id",

  protect,

  adminOnly,

  updateStock

);




/*
====================================
PRODUCT RECOMMENDATION
====================================
*/

router.get(

  "/recommend/:id",

  recommendProducts

);




/*
====================================
GET ALL PRODUCTS (PUBLIC)
====================================
*/

router.get(

  "/",

  getProducts

);




/*
====================================
SEARCH PRODUCTS
====================================
*/

router.get(

  "/search",

  searchProducts

);




/*
====================================
FILTER PRODUCTS
====================================
*/

router.get(

  "/category/:category",

  filterCategory

);




/*
====================================
GET SINGLE PRODUCT
====================================
*/

router.get(

  "/:id",

  getProduct

);




/*
====================================
UPDATE PRODUCT (ADMIN)
====================================
*/

router.put(

  "/:id",

  protect,

  adminOnly,

  updateProduct

);




/*
====================================
DELETE PRODUCT (ADMIN)
====================================
*/

router.delete(

  "/:id",

  protect,

  adminOnly,

  deleteProduct

);




module.exports =
router;
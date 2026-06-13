const express =
require("express");


const router =
express.Router();



const {

  createOrder,


  getOrders,


  getSingleOrder,


  downloadInvoice,


  updateOrderStatus,


} = require(
  "../controllers/orderController"
);



const {

  protect,


  adminOnly,


} =
require(
 "../middleware/authMiddleware"
);




/*
=========================
CREATE ORDER USER
=========================
*/


router.post(

 "/",

 protect,

 createOrder

);





/*
=========================
DOWNLOAD INVOICE
=========================
*/


router.get(

 "/invoice/:id",

 protect,

 downloadInvoice

);





/*
=========================
UPDATE ORDER STATUS ADMIN
=========================
*/


router.put(

 "/status/:id",

 protect,

 adminOnly,

 updateOrderStatus

);





/*
=========================
GET ALL ORDERS ADMIN
=========================
*/


router.get(

 "/",

 protect,

 adminOnly,

 getOrders

);





/*
=========================
GET SINGLE ORDER USER
=========================
*/


router.get(

 "/:id",

 protect,

 getSingleOrder

);




module.exports =
router;
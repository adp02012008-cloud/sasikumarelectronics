require("dotenv").config();

console.log("Starting Server...");


const express =
require("express");


const cors =
require("cors");


const cron =
require("node-cron");


const helmet =
require("helmet");


const rateLimit =
require("express-rate-limit");


const mongoSanitize =
require("express-mongo-sanitize");


// const xss =
// require("xss-clean");


const compression =
require("compression");


const path =
require("path");


const connectDB =
require("./config/db");


const updateDynamicPrices =
require(
 "./utils/dynamicPricing"
);



connectDB();



const app =
express();





/*
=========================
SECURITY + PERFORMANCE
=========================
*/


app.use(
 helmet()
);



app.use(
 cors({

  origin:
  process.env.CLIENT_URL
  ||
  "http://localhost:5173",


  credentials:true

 })
);



app.use(
 compression()
);



app.use(
 express.json({

  limit:
  "10mb"

 })
);



app.use(
 express.urlencoded({

  extended:true,

  limit:
  "10mb"

 })
);



app.use(
 mongoSanitize()
);



// app.use(
//  xss()
// );





const limiter =
rateLimit({

 windowMs:
 15 * 60 * 1000,

 max:
 100,

 message:{
  success:false,
  message:
  "Too many requests, please try again later"
 }

});



app.use(
 limiter
);







/*
=========================
STATIC FILES
=========================
*/


app.use(

 "/invoices",

 express.static(

  path.join(
   __dirname,
   "invoices"
  )

 )

);








app.get(
 "/",
 (req,res)=>{


  res.send(
   "API Running"
  );


 }
);





/*
=========================
ROUTES IMPORT
=========================
*/


const authRoutes =
require(
 "./routes/authRoutes"
);



const productRoutes =
require(
 "./routes/productRoutes"
);



const cartRoutes =
require(
 "./routes/cartRoutes"
);



const wishlistRoutes =
require(
 "./routes/wishlistRoutes"
);



const reviewRoutes =
require(
 "./routes/reviewRoutes"
);



const orderRoutes =
require(
 "./routes/orderRoutes"
);



const adminRoutes =
require(
 "./routes/adminRoutes"
);



const paymentRoutes =
require(
 "./routes/paymentRoutes"
);



const userRoutes =
require(
 "./routes/userRoutes"
);



const couponRoutes =
require(
 "./routes/couponRoutes"
);



const activityRoutes =
require(
 "./routes/activityRoutes"
);



const searchRoutes =
require(
 "./routes/searchRoutes"
);







/*
=========================
API ROUTES
=========================
*/


app.use(
 "/api/auth",
 authRoutes
);



app.use(
 "/api/products",
 productRoutes
);



app.use(
 "/api/cart",
 cartRoutes
);



app.use(
 "/api/wishlist",
 wishlistRoutes
);



app.use(
 "/api/reviews",
 reviewRoutes
);



app.use(
 "/api/orders",
 orderRoutes
);



app.use(
 "/api/admin",
 adminRoutes
);



app.use(
 "/api/payment",
 paymentRoutes
);



app.use(
 "/api/users",
 userRoutes
);



app.use(
 "/api/coupons",
 couponRoutes
);



app.use(
 "/api/activity",
 activityRoutes
);



app.use(
 "/api/search",
 searchRoutes
);










/*
=========================
DYNAMIC PRICE SCHEDULER
=========================
*/


cron.schedule(

 "0 * * * *",

 ()=>{


  updateDynamicPrices();


 }

);



console.log(
 "Dynamic Pricing Scheduler Started"
);









/*
=========================
SERVER
=========================
*/


const PORT =
process.env.PORT || 5000;



app.listen(

 PORT,

 ()=>{


  console.log(

   `Server Running On Port ${PORT}`

  );


 }

);
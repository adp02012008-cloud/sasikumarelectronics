require("dotenv").config();

console.log("Starting Server...");

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");

const connectDB = require("./config/db");
const updateDynamicPrices = require("./utils/dynamicPricing");
const passport = require("./config/passport");

connectDB();

const app = express();

app.set("trust proxy", 1);

/*
=========================
CORS SETUP
=========================
*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://sasikumarelectronics.vercel.app",
  "https://sasikumarelectronics-ib6gue073-adp02012008-4604s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/*
=========================
SECURITY + PERFORMANCE
=========================
*/

app.use(helmet());
app.use(compression());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/*
=========================
PASSPORT GOOGLE AUTH
=========================
*/

app.use(passport.initialize());

/*
=========================
RATE LIMITER
=========================
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", apiLimiter);

/*
=========================
STATIC FILES
=========================
*/

app.use(
  "/invoices",
  express.static(path.join(__dirname, "invoices"))
);

/*
=========================
HOME ROUTE
=========================
*/

app.get("/", (req, res) => {
  res.send("API Running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

/*
=========================
ROUTES IMPORT
=========================
*/

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const couponRoutes = require("./routes/couponRoutes");
const activityRoutes = require("./routes/activityRoutes");
const searchRoutes = require("./routes/searchRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

/*
=========================
API ROUTES
=========================
*/

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/delivery", deliveryRoutes);

/*
=========================
DYNAMIC PRICE SCHEDULER
=========================
*/

cron.schedule("0 * * * *", () => {
  updateDynamicPrices();
});

console.log("Dynamic Pricing Scheduler Started");

/*
=========================
ERROR HANDLER
=========================
*/

app.use((err, req, res, next) => {
  console.log("Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/*
=========================
SERVER
=========================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
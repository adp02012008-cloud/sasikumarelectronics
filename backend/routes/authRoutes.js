const express = require("express");
const passport = require("passport");

const router = express.Router();

const {
  register,
  login,
  profile,
  googleCallback,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, profile);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  googleCallback
);

module.exports = router;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const ADMIN_EMAILS = [
  "adp02012008@gmail.com",
  "sdhivakar2901@gmail.com",
  process.env.ADMIN_EMAIL,
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const rawEmail = profile.emails?.[0]?.value;

        if (!rawEmail) {
          return done(null, false);
        }

        const email = rawEmail.toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(email);
        const photoUrl = profile.photos?.[0]?.value || "";
        let user = await User.findOne({ email });

        if (user) {
          let updated = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            updated = true;
          }
          if (profile.displayName && (!user.name || user.name.trim().length <= 2 || user.name === "a")) {
            user.name = profile.displayName;
            updated = true;
          }
          if (photoUrl && (!user.avatar || user.avatar !== photoUrl)) {
            user.avatar = photoUrl;
            updated = true;
          }
          if (isAdmin && user.role !== "admin") {
            user.role = "admin";
            updated = true;
          }
          if (updated) {
            await user.save();
          }

          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || email.split("@")[0],
          email,
          googleId: profile.id,
          avatar: photoUrl,
          role: isAdmin ? "admin" : "user",
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
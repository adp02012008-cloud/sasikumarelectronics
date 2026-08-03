const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

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
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
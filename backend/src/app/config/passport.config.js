import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.users.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        if (!user.password) {
          return done(null, false, {
            message: "Please login with your social account.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        if (!user.isVerified) {
          return done(null, false, {
            message: "User is not verified. Please verify your email.",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const nameParts = profile.displayName.split(" ");
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(" ") || "";
        const avatarUrl = profile.photos[0]?.value;

        let user = await prisma.users.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.users.create({
            data: {
              email,
              first_name,
              last_name,
              avatar: avatarUrl,
              is_verified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Optional: Serialize/Deserialize if sessions are used (not strictly needed for JWT but good to have)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.users.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

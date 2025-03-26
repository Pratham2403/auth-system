import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const configurePassport = () => {
  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          // Find user by username
          const user = await User.findOne({ username }).select("+password");
          
          // Check if user exists
          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          // Check if password matches
          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await User.findOne({
              email: profile.emails[0].value,
            });

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "google") {
                user.provider = "google";
                user.providerId = profile.id;
                user.profilePicture = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              profilePicture: profile.photos[0].value,
              provider: "google",
              providerId: profile.id,
            });

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // GitHub Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: "/api/auth/github/callback",
          scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Get primary email from GitHub
            const primaryEmail = profile.emails && profile.emails[0].value;

            if (!primaryEmail) {
              return done(
                new Error("No email found from GitHub profile"),
                null
              );
            }

            // Check if user already exists
            let user = await User.findOne({ email: primaryEmail });

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "github") {
                user.provider = "github";
                user.providerId = profile.id;
                user.profilePicture = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName || profile.username,
              email: primaryEmail,
              profilePicture: profile.photos[0].value,
              provider: "github",
              providerId: profile.id,
            });

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // LinkedIn Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: "/api/auth/linkedin/callback",
          scope: ["r_emailaddress", "r_liteprofile"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Get email from LinkedIn
            const email = profile.emails && profile.emails[0].value;

            if (!email) {
              return done(
                new Error("No email found from LinkedIn profile"),
                null
              );
            }

            // Check if user already exists
            let user = await User.findOne({ email });

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "linkedin") {
                user.provider = "linkedin";
                user.providerId = profile.id;
                user.profilePicture = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName,
              email,
              profilePicture: profile.photos[0].value,
              provider: "linkedin",
              providerId: profile.id,
            });

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
};

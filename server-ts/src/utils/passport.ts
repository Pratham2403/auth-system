import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from "passport-linkedin-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import { User, IBaseUser } from "@models/user.model";
import dotenv from "dotenv";
import { Document } from "mongoose";

dotenv.config();

// Type intersection for User document to include Mongoose methods and IBaseUser properties
type UserDocument = IBaseUser & Document;

export const configurePassport = () => {
  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
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
          // We cast to UserDocument to ensure TS understands the shape, though User.findOne matches the schema
          const user = await User.findOne({ username }).select("+password") as UserDocument | null;

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
        async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
          try {
            // Check if user already exists
            let user = await User.findOne({
              email: profile.emails?.[0].value,
            }) as UserDocument | null;

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "google") {
                user.provider = "google";
                user.providerId = profile.id;
                user.profilePicture = {
                    url: profile.photos?.[0].value || "",
                    publicId: ""
                };
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0].value,
              profilePicture: {
                  url: profile.photos?.[0].value || "",
                  publicId: ""
              },
              provider: "google",
              providerId: profile.id,
            }) as unknown as UserDocument;

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
        async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (error: any, user?: any) => void) => {
          try {
            // Get primary email from GitHub
            // profile.emails is array of { value: string }
            const primaryEmail = profile.emails && profile.emails[0]?.value;

            if (!primaryEmail) {
              return done(
                new Error("No email found from GitHub profile"),
                undefined
              );
            }

            // Check if user already exists
            let user = await User.findOne({ email: primaryEmail }) as UserDocument | null;

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "github") {
                user.provider = "github";
                user.providerId = profile.id;
                user.profilePicture = {
                    url: profile.photos?.[0].value || "",
                    publicId: ""
                };
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName || profile.username,
              email: primaryEmail,
              profilePicture: {
                  url: profile.photos?.[0].value || "",
                  publicId: ""
              },
              provider: "github",
              providerId: profile.id,
            }) as unknown as UserDocument;

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
          callbackURL: "/auth-system/v0/auth/linkedin/callback",
          scope: ["r_emailaddress", "r_liteprofile"],
        },
        async (accessToken: string, refreshToken: string, profile: LinkedInProfile, done: (error: any, user?: any) => void) => {
          try {
            // Get email from LinkedIn
            const email = profile.emails && profile.emails[0]?.value;

            if (!email) {
              return done(
                new Error("No email found from LinkedIn profile"),
                undefined
              );
            }

            // Check if user already exists
            let user = await User.findOne({ email }) as UserDocument | null;

            if (user) {
              // Update provider details if user exists but registered with different provider
              if (user.provider !== "linkedin") {
                user.provider = "linkedin";
                user.providerId = profile.id;
                user.profilePicture = {
                    url: profile.photos?.[0].value || "",
                    publicId: ""
                };
                await user.save();
              }
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName,
              email,
              profilePicture: {
                  url: profile.photos?.[0].value || "",
                  publicId: ""
              },
              provider: "linkedin",
              providerId: profile.id,
            }) as unknown as UserDocument;

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
};

import User from "../../models/User.js";
import passport from "passport";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { sendActivationEmail } from "../user/email.service.js";
import { verifyUserDetails } from "../user/user.service.js";
import { uploadOnCloudinary } from "../../config/coludinaryConnection.js";

const sendTokenResponse = (user, statusCode, res, storageType = "local") => {
  // Create token
  const token = user.getSignedJwtToken();

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_EXPIRE.match(/(\d+)d/)[1] * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Set secure flag in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // Handle different storage types
  switch (storageType) {
    case "cookie":
      res.cookie("token", token, cookieOptions);
      return res.status(statusCode).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
          provider: user.provider,
        },
      });

    case "local":
    case "session":
      return res.status(statusCode).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
          provider: user.provider,
        },
      });

    default:
      res.cookie("token", token, cookieOptions);
      return res.status(statusCode).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
          provider: user.provider,
        },
      });
  }
};

export const validateCredentials = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    // Find user by username
    const user = await User.findOne({ username }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Return success without token or sensitive user data
    return res.status(200).json({
      success: true,
      message: "Credentials validated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, username, userType, email } = req.body;

    if (!name || !username || !userType || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, username, userType, email",
      });
    }

    // Verify user details against existing information
    const user = await verifyUserDetails(userType, username, name);

    // Update user with email
    user.email = email;

    // Handle profile picture upload if file exists
    if (req.file) {
      try {
        // Upload image to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

        if (cloudinaryResponse) {
          // Set profile picture details
          user.profilePicture = {
            url: cloudinaryResponse.url,
            publicId: cloudinaryResponse.public_id,
          };
        }
      } catch (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        // Continue registration even if image upload fails
      }
    }

    await user.save();

    // Send activation email with token
    await sendActivationEmail(user, email);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to set your password.",
    });
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token and new password",
      });
    }

    // Find user with valid activation token
    const user = await User.findOne({
      activationToken: token,
      activationExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Clean up expired tokens
      await User.updateOne(
        { activationToken: token },
        {
          $unset: { activationToken: 1, activationExpires: 1 },
        }
      );

      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Set password and activate account
    user.password = newPassword;
    user.active = true;
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password has been set successfully. Your account is now active.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const storageType = req.query.storage || "local";

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || "Invalid credentials",
        });
      }

      // Send token response
      sendTokenResponse(user, 200, res, storageType);
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    // Check if using cookie storage
    if (req.cookies.token) {
      // Clear the cookie by setting expiration in the past
      res.cookie("token", "none", {
        expires: new Date(Date.now() - 10 * 1000), // 10 seconds ago
        httpOnly: true,
      });
    }

    // Update last login time
    User.findByIdAndUpdate(
      req.user.id,
      { lastLogin: Date.now() },
      { new: false }
    ).catch((err) => console.log("Error updating last login time:", err));

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

export const initiateSSO = (req, res) => {
  const { provider, redirect } = req.query;
  const storageType = req.query.storage || "cookie";

  // Store redirect URL in session (for OAuth callbacks)
  req.session.ssoRedirectUrl = redirect || "/dashboard";

  // Check if provider is specified and valid
  if (!provider || !["google", "github", "linkedin"].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing SSO provider",
    });
  }

  // Redirect to appropriate OAuth provider
  return res.redirect(`/api/auth/${provider}?storage=${storageType}`);
};

// LinkedIn OAuth callback - only for login (not signup)
export const linkedinCallback = (req, res, next) => {
  const storageType = req.query.storage || "local";
  const redirectUrl =
    req.query.redirect || `${process.env.CLIENT_URL}/auth/success`;

  passport.authenticate(
    "linkedin",
    { session: false },
    async (err, user, info) => {
      if (err) {
        console.error("LinkedIn authentication error:", err);
        return res.redirect(
          `${redirectUrl}?error=${encodeURIComponent(
            err.message || "LinkedIn authentication failed"
          )}`
        );
      }

      if (!user) {
        // If no user was found, this means the user doesn't exist
        // Since we're implementing login only (not signup), we redirect with error
        return res.redirect(
          `${redirectUrl}?error=${encodeURIComponent(
            "No account found with these credentials. LinkedIn login is for existing users only."
          )}`
        );
      }

      try {
        // Generate token
        const token = user.getSignedJwtToken();

        // Update last login time
        await User.findByIdAndUpdate(
          user._id,
          { lastLogin: Date.now() },
          { new: false }
        );

        // Redirect based on storage type
        if (storageType === "cookie") {
          // Set cookie
          const cookieOptions = {
            expires: new Date(
              Date.now() +
                process.env.JWT_EXPIRE.match(/(\d+)d/)[1] * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          if (process.env.NODE_ENV === "production") {
            cookieOptions.secure = true;
          }

          res.cookie("token", token, cookieOptions);
          return res.redirect(`${redirectUrl}?success=true`);
        } else {
          // Redirect with token in URL for local/session storage
          return res.redirect(`${redirectUrl}?token=${token}&success=true`);
        }
      } catch (error) {
        console.error("Error generating token:", error);
        return res.redirect(
          `${redirectUrl}?error=${encodeURIComponent(
            "Error during authentication"
          )}`
        );
      }
    }
  )(req, res, next);
};

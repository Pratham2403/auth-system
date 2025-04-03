import User from "../../models/User.js";
import passport from "passport";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { sendActivationEmail } from "../user/email.service.js";
import { verifyUserDetails } from "../user/user.service.js";
import { uploadOnCloudinary } from "../../config/coludinaryConnection.js";

// Helper function to generate token and handle response
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

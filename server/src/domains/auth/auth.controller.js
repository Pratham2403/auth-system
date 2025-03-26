import User from "../../models/User.js";
import passport from "passport";


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

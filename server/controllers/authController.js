import User from "../models/User.js";
import passport from "passport";
import jwt from "jsonwebtoken";

// Helper function to generate token and handle response
const sendTokenResponse = (user, statusCode, res, storageType = "cookie") => {
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
          role: user.role,
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
          role: user.role,
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
          role: user.role,
          profilePicture: user.profilePicture,
          provider: user.provider,
        },
      });
  }
};

// @desc    Initiate SSO authentication
// @route   GET /api/auth/sso
// @access  Public
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

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      provider: "local",
    });

    // Get storage type from query or default to cookie
    const storageType = req.query.storage || "cookie";

    // Send token response
    sendTokenResponse(user, 201, res, storageType);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = (req, res, next) => {
  const storageType = req.query.storage || "cookie";
  console.log("Login tak to aaye");

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
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res, next) => {
  const storageType = req.query.storage || "cookie";

  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent(
          err.message
        )}`
      );
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=Authentication failed`
      );
    }

    // Generate token
    const token = user.getSignedJwtToken();

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
      return res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } else {
      // Redirect with token in URL for local/session storage
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/success?token=${token}`
      );
    }
  })(req, res, next);
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = (req, res, next) => {
  const storageType = req.query.storage || "cookie";

  passport.authenticate("github", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent(
          err.message
        )}`
      );
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=Authentication failed`
      );
    }

    // Generate token
    const token = user.getSignedJwtToken();

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
      return res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } else {
      // Redirect with token in URL for local/session storage
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/success?token=${token}`
      );
    }
  })(req, res, next);
};

// @desc    LinkedIn OAuth callback
// @route   GET /api/auth/linkedin/callback
// @access  Public
export const linkedinCallback = (req, res, next) => {
  const storageType = req.query.storage || "cookie";

  passport.authenticate("linkedin", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent(
          err.message
        )}`
      );
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=Authentication failed`
      );
    }

    // Generate token
    const token = user.getSignedJwtToken();

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
      return res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } else {
      // Redirect with token in URL for local/session storage
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/success?token=${token}`
      );
    }
  })(req, res, next);
};

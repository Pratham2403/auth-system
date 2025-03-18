import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  getMe,
  googleCallback,
  githubCallback,
  linkedinCallback,
  initiateSSO
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Register and login routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.get('/sso', initiateSSO);

// Google OAuth routes
router.get("/google", (req, res, next) => {
  // Pass storage type to callback
  const storageType = req.query.storage || "cookie";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: storageType,
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    // Get storage type from state
    req.query.storage = req.query.state;
    next();
  },
  googleCallback
);

// GitHub OAuth routes
router.get("/github", (req, res, next) => {
  // Pass storage type to callback
  const storageType = req.query.storage || "cookie";
  passport.authenticate("github", {
    scope: ["user:email"],
    state: storageType,
  })(req, res, next);
});

router.get(
  "/github/callback",
  (req, res, next) => {
    // Get storage type from state
    req.query.storage = req.query.state;
    next();
  },
  githubCallback
);

// LinkedIn OAuth routes
router.get("/linkedin", (req, res, next) => {
  // Pass storage type to callback
  const storageType = req.query.storage || "cookie";
  passport.authenticate("linkedin", {
    state: storageType,
  })(req, res, next);
});

router.get(
  "/linkedin/callback",
  (req, res, next) => {
    // Get storage type from state
    req.query.storage = req.query.state;
    next();
  },
  linkedinCallback
);

export default router;

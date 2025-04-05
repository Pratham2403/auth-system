import express from "express";
// import {body} from "express-validator"
import {
  login,
  logout,
  register,
  setPassword,
  linkedinCallback,
} from "./auth.controller.js";
import { authenticate } from "../../../../../shared/middlewares/auth.middleware.js";
import { upload } from "../../../../../shared/middlewares/multer.middleware.js";
import passport from "passport";

const router = express.Router();

router.post("/login", login);
router.get("/logout", authenticate, logout);
router.post("/register", upload.single("profilePicture"), register);
router.post("/set-password", setPassword);

// // LinkedIn OAuth routes
// router.get("/linkedin", (req, res, next) => {
//   // Pass storage type to callback
//   const storageType = req.query.storage || "cookie";
//   passport.authenticate("linkedin", {
//     state: storageType,
//   })(req, res, next);
// });

// router.get(
//   "/linkedin/callback",
//   (req, res, next) => {
//     // Get storage type from state
//     req.query.storage = req.query.state;
//     next();
//   },
//   linkedinCallback
// );

export default router;

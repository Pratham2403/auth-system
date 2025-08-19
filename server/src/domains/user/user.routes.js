import express from "express";
import { UserType } from "../../../../../shared/types/user.type.js";
import { getUserById, resetUser, getAllUsers } from "./user.controller.js";
import {
  authenticate,
  requireRole,
} from "../../../../../shared/middlewares/auth.middleware.js";
const router = express.Router();

// Supports pagination and filters via body
router.post("/all", authenticate, getAllUsers);

router.post(
  "/getUserById",
  // authenticate,
  // requireRole(UserType.ADMIN),
  getUserById
);

router.put("/reset/:id", authenticate, requireRole(UserType.ADMIN), resetUser);

export default router;

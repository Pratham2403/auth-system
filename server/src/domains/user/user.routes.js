import express from "express";
import { UserType } from "../../../../../shared/types/user.type.js";
import {
  getUserById,
  resetUser,
  getAllUsers,
  getProfessorsBySIG,
  updateProfessorDetails,
} from "./user.controller.js";
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

// SIG-related professor endpoints
router.get("/professors/sig/:sigId", getProfessorsBySIG);
router.put(
  "/professor/:userId",
  authenticate,
  requireRole(UserType.ADMIN),
  updateProfessorDetails
);

export default router;

import express from "express";
import {
  getPublicMembers,
  getGroupedMembers,
  createMemberRoles,
  deleteMemberRole,
  getMemberRoles,
} from "./member.controller.js";
import {
  authenticate,
  requireRole,
} from "../../../../../shared/middlewares/auth.middleware.js";
import { UserType } from "../../../../../shared/types/user.type.js";

const router = express.Router();

// Public routes - No authentication required
router.get("/", getPublicMembers);
router.get("/grouped", getGroupedMembers);

// Admin routes - Authentication and Admin role required
router.post(
  "/member-roles",
  authenticate,
  requireRole(UserType.ADMIN),
  createMemberRoles
);

router.delete(
  "/member-roles/:id",
  authenticate,
  requireRole(UserType.ADMIN),
  deleteMemberRole
);

router.get(
  "/member-roles",
  authenticate,
  requireRole(UserType.ADMIN),
  getMemberRoles
);

export default router;

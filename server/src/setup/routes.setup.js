import express from "express";
import authRoutes from "../domains/auth/auth.route.js";
import userRoutes from "../domains/user/user.routes.js";
import memberRolesRoutes from "../domains/member-roles/member.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/member", memberRolesRoutes);

export default router;

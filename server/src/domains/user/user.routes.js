import express from "express"
import { UserType } from "../../../../../shared/types/user.type.js";
import { createUser, getUsers, getUserById, updateUser, resetUser , deleteUser, registerUser} from "./user.controller.js";
import {authenticate, requireRole} from "../../../../../shared/middlewares/auth.middleware.js"
const router = express.Router();


router.post("/register", authenticate, requireRole(UserType.ADMIN), registerUser)
router.post("/getUserById", authenticate, requireRole(UserType.ADMIN), getUserById)

export default router;
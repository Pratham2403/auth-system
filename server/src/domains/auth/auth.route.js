import express from "express"
// import {body} from "express-validator"
import { login, logout } from "./auth.controller.js";
import { authenticate } from "../../../../../shared/middlewares/auth.middleware.js";

const router = express.Router()

router.post("/login", login);
router.get("/logout", authenticate, logout);

export default router
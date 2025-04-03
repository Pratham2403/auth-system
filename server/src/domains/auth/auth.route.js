import express from "express";
// import {body} from "express-validator"
import { login, logout, register, setPassword } from "./auth.controller.js";
import { authenticate } from "../../../../../shared/middlewares/auth.middleware.js";
import {upload} from "../../../../../shared/middlewares/multer.middleware.js"

const router = express.Router();

router.post("/login", login);
router.get("/logout", authenticate, logout);
router.post("/register", upload.single("profilePicture"), register);
router.post("/set-password", setPassword);

export default router;

import express from "express"
import authRoutes from "../domains/auth/auth.route.js"
import userRoutes from "../domains/user/user.routes.js"

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/user", userRoutes)


export default router

import express from "express"
// import {body} from "express-validator"
import { login } from "./auth.controller.js";


const router = express.Router()



router.post("/login", login);


export default router
import express from "express"
import { checkLoggedin, rejectUnauthenticated } from "../../middlewares/auth.middleware.js"
import { getUserDetails, setUserDetails } from "./user.controller.js"


const router = express.Router()

router.post("/save-details", checkLoggedin, rejectUnauthenticated, setUserDetails)
router.get("/details", checkLoggedin, rejectUnauthenticated, getUserDetails)

export default router
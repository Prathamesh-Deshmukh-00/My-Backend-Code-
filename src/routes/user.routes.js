import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

//route for register user 
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

// route for login user
router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)

//for provide new  refresh and access token to user
router.route("/refresh-token").post(refreshAccessToken);


export default router
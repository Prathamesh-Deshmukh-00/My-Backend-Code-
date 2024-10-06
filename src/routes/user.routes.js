import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken,changeCurrentPassword ,getCurrentuser, updateAccountDetails , updateUserAvatar , updateUsearCoverImage,getUserChannelProfile,getWatchHistory} from "../controllers/user.controllers.js";
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

//secure route for logout user 
router.route("/logout").post(verifyJWT,logoutUser)

//for provide new  refresh and access token to user
router.route("/refresh-token").post(refreshAccessToken);

//route for change password 
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

//route for getcurrent user 
router.route("/current-user").get(verifyJWT,getCurrentuser)

// route for update account details 
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// route for update user avatar 
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)

//route for update cover image 
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"), updateUsearCoverImage)

// route for get user channel profile 
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

//route for get user watch history 
router.route("/history").get(verifyJWT , getWatchHistory)

export default router
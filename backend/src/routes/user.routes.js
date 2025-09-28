import {
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfileByUsername,
  deleteAccount,
  getAllUsers,
  forgotPassword,
  resetPassword
}
  from "../controllers/user.controller.js";
import { Router } from "express"

import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

// PUBLIC ROUTES (No authentication required)
router.route("/register").post(
  upload.fields([
    {
      name: "avatar", maxCount: 1
    },
    {
      name: "coverImage", maxCount: 1
    }
  ]), registerUser
)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:token").post(resetPassword)
// PROTECTED ROUTES (Authentication required in these routes)
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account-detail").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/username-profile/:username").get(verifyJWT, getUserProfileByUsername)
router.route("/delete-account").delete(verifyJWT, deleteAccount)
router.route("/all-users").get(verifyJWT, getAllUsers)

export default router
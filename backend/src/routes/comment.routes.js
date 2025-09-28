import { Router } from "express"
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPost,
  toggleCommentLike,
  updateComment
} from "../controllers/comment.controller.js"

import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

// public routes
router.route("/post/:postId").get(getCommentsByPost)
router.route("/:commentId").get(getCommentById)

// secured routes
router.route("/post/:postId").post(verifyJWT, createComment)
router.route("/:commentId").patch(verifyJWT, updateComment)
router.route("/:commentId").delete(verifyJWT, deleteComment)
router.route("/:commentId/like").post(verifyJWT, toggleCommentLike)

export default router
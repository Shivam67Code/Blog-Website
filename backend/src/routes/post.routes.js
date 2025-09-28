import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getAllPosts, getMyPosts, getPostById, getPostsByAuthor, togglePostLike, updatePost } from "../controllers/post.controller.js";


const router = Router();

// route is /api/v1/posts/${route}
// PUBLIC ROUTES
router.route("/").get(getAllPosts)
router.route("/:postId").get(getPostById)
router.route("/author/:authorId").get(getPostsByAuthor)

// PROTECTED ROUTES
router.route("/create").post(verifyJWT, upload.single("featuredImage"), createPost)
router.route("/my-posts").get(verifyJWT, getMyPosts)
router.route("/:postId/update").patch(verifyJWT, upload.single("featuredImage"), updatePost)
router.route("/:postId/delete").delete(verifyJWT, deletePost)
router.route("/:postId/like").patch(verifyJWT, togglePostLike);

export default router;
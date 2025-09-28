import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Post } from "../models/post.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary"

// create post
const createPost = asyncHandler(async (req, res) => {
  // 1.get contents
  const { tags, content, title } = req.body
  // 2. check for content fields
  if (!content || !title) {
    throw new ApiError(400, "Title and Content are required")
  }
  // 3.check for imageUrl
  let featuredImageUrl = "";
  if (req.file) {
    const featuredImageLocalPath = req.file.path;
    const featuredImage = await uploadOnCloudinary(featuredImageLocalPath)
    featuredImageUrl = featuredImage?.url || ""
  }
  // 4.create a post
  const post = await Post.create({
    title,
    author: req.user._id,
    content,
    featuredImage: featuredImageUrl,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  })
  // 5/check if post created 
  const createdPost = await Post.findById(post._id).populate('author', 'username email');
  // 6.send response
  return res
    .status(200)
    .json(new ApiResponse(200, createdPost, "Post Created SuccessFully"))
})

// getall posts with pagination
const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tags, search, } = req.query
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } }, // i for case sensitive
      { content: { $regex: search, $options: 'i' } }
    ]
  }
  if (tags) {
    query.tags = { $in: tags.split(",") }
  }
  const posts = await Post.find(query)
    .populate('author', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const totalPosts = await Post.countDocuments(query)

  return res.status(200)
    .json(
      new ApiResponse(200,
        { posts, totalPosts, totalPages: Math.ceil(totalPosts / limit), currentPage: page }
        ,
        "Posts fetched SuccessFully")
    )
})

// Get single post By Id
const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(404, "Post ID not given")
  }
  const post = await Post.findById(postId).populate('author', 'username email avatar')
  if (!post) {
    throw new ApiError(404, 'Post not found')
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, post, "Post Fetched SUccessfully")
    )
})

// update post
const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body

  const post = await Post.findById(postId)

  if (!post) {
    throw new ApiError(404, 'Post not found')
  }
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to UPdate this Post !!!")
  }
  let featuredImageUrl = post.featuredImage;
  if (req.file) {
    const featuredImageLocalPath = req.file.path
    const featuredImage = await uploadOnCloudinary(featuredImageLocalPath)
    featuredImageUrl = featuredImage?.url || post.featuredImage;
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      title: title || post.title,
      content: content || post.content,
      featuredImage: featuredImageUrl,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : post.tags
    },
    { new: true }
  ).populate("author", "username email avatar")
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPost, "Post Updated SuccessFully")
    )
})

// delete post
// getpostByAuthor
// getMYPosts
// togglePostLiek
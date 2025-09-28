import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Post } from "../models/post.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

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
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)

  if (!post) {
    throw new ApiError(404, "Post not found")
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You aer not authorized to Delete this Post")
  }

  await Post.findByIdAndDelete(postId)

  return res.status(200)
    .json(
      new ApiResponse(200, {}, "Post Deleted SuccessFullly")
    )
})
// getpostByAuthor
const getPostsByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;
  const { page = 1, limit = 10 } = req.query

  const posts = await Post.find({ author: authorId })
    .populate('author', 'username email avatar')
    .sort({ createdAt: -1 }) // show neweset first
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

  const totalPosts = await Post.countDocuments({ author: authorId })

  return res.status(200).json(
    new ApiResponse(200, {
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page
    }, "Author Posts Fetched SuccessFully")
  )
})
// getMYPosts
const getMyPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  const posts = await Post.find({ author: req.user._id })
    .populate('author', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

  const totalPosts = await Post.countDocuments({ author: req.user._id })

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
      }, "Your Posts fetched SuccessFully"
    ))

})
// togglePostLiek
const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params
  const userId = req.user._id

  const post = await Post.findById(postId)
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    //if already liked then remove the like
    post.likes = post.likes.filter(id => id.toString() !== userId.toString())
  } else {
    // if not liked then add the like
    post.likes.push(userId)
  }
  await post.save()

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        isLiked: !isLiked,
        likesCount: post.likes.length
      }, isLiked ? " Post unliked SuccessFully" : "Post liked Successfully")
    )

})

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByAuthor,
  getMyPosts,
  togglePostLike
}
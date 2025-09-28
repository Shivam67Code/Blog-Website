import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

// Create comment or reply (anyone can comment on any post)
const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  if (parentId) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new ApiError(400, "Invalid parent comment ID");
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: content.trim(),
    parent: parentId || null,
  });


  const populatedComment = await Comment.findById(comment._id)
    .populate("author", "username avatar");

  res.status(201).json(
    new ApiResponse(201, populatedComment, "Comment created successfully")
  );
});

// Update comment 
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Only author can update their comment
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own comments");
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await comment.save();

  const updatedComment = await Comment.findById(commentId)
    .populate("author", "username avatar");

  res.status(200).json(
    new ApiResponse(200, updatedComment, "Comment updated successfully")
  );
});

// Delete comment 
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Only author can delete their comment
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await Comment.deleteMany({
    $or: [
      { _id: commentId },
      { parent: commentId }
    ]
  });

  res.status(200).json(
    new ApiResponse(200, {}, "Comment and replies deleted successfully")
  );
});

// Get comments for a post with replies
const getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const skip = (page - 1) * limit;

  const comments = await Comment.find({
    post: postId,
    parent: null
  })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({ parent: comment._id })
        .populate("author", "username avatar")
        .sort({ createdAt: 1 });

      return {
        ...comment.toObject(),
        replies,
        repliesCount: replies.length
      };
    })
  );

  const totalComments = await Comment.countDocuments({
    post: postId,
    parent: null
  });

  res.status(200).json(
    new ApiResponse(200, {
      comments: commentsWithReplies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNextPage: page * limit < totalComments,
        hasPrevPage: page > 1
      }
    }, "Comments fetched successfully")
  );
});

// Toggle like/unlike on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    comment.likes = comment.likes.filter(
      id => id.toString() !== userId.toString()
    );
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  res.status(200).json(
    new ApiResponse(200, {
      isLiked: !isLiked,
      likesCount: comment.likes.length
    }, isLiked ? "Comment unliked" : "Comment liked")
  );
});

const getCommentById = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId)
    .populate("author", "username avatar")
    .populate("post", "title");

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Get replies if it's a parent comment
  let replies = [];
  if (!comment.parent) {
    replies = await Comment.find({ parent: commentId })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 });
  }

  res.status(200).json(
    new ApiResponse(200, {
      ...comment.toObject(),
      replies,
      repliesCount: replies.length
    }, "Comment fetched successfully")
  );
});

export {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
  toggleCommentLike,
  getCommentById
};
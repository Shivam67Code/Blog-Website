import { Link } from "react-router-dom";
import type { Post } from "../types";
import { Calendar, User, Heart, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "../features/auth/AuthContext";
import { postsAPI } from "../services/api";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmationModal from "./ConfirmationModal";

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ""));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      const res = await postsAPI.toggleLike(post._id);
      setIsLiked(res.data.data.isLiked);
      setLikesCount(res.data.data.likesCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postsAPI.deletePost(post._id);
      toast.success("Post deleted!");
      // refresh or update state as needed
    } catch (e) {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const excerpt = post.content.length > 150
    ? post.content.substring(0, 150) + "..."
    : post.content;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {post.featuredImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <Link to={`/blog/${post._id}`} className="block">
          <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User size={16} /> {post.author?.username || post.author?.fullName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} /> {format(new Date(post.createdAt), "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isLiked
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                }`}
            >
              <Heart size={16} className={isLiked ? "fill-current" : ""} />
              {likesCount}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </motion.div>
  );
}
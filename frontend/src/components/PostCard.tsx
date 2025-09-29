import { Link } from "react-router-dom";
import type { Post } from "../types";
import { Calendar, User, Heart, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "../features/auth/AuthContext";
import { postsAPI } from "../services/api";
import { useState } from "react";
import { toast } from "sonner";

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ""));
  const [likesCount, setLikesCount] = useState(post.likes.length);

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
        </div>
      </div>
    </motion.div>
  );
}
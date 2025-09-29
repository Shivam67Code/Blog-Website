import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postsAPI } from "../services/api";
import type { Post } from "../types";
import Loader from "../components/Loader";
import { format } from "date-fns";
import { useAuth } from "../features/auth/AuthContext";
import { toast } from "sonner";
import { Pencil, Trash2, Heart, Tag, User, Calendar } from "lucide-react";
import CommentSection from "../components/CommentSection";

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await postsAPI.getPostById(id!);
      const postData = res.data.data;
      setPost(postData);
      setIsLiked(postData.likes.includes(user?._id || ""));
      setLikesCount(postData.likes.length);
    } catch (error) {
      toast.error("Post not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postsAPI.deletePost(id!);
      toast.success("Post deleted successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      const res = await postsAPI.toggleLike(id!);
      setIsLiked(res.data.data.isLiked);
      setLikesCount(res.data.data.likesCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) return <Loader />;
  if (!post) return null;

  const isAuthor = user && user._id === post.author._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {/* Author and Date */}
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span>By {post.author?.username || post.author?.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span>{format(new Date(post.createdAt), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={20} />
            <span>{likesCount} likes</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isLiked
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
              }`}
          >
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
            {isLiked ? "Liked" : "Like"} ({likesCount})
          </button>

          {isAuthor && (
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                onClick={() => navigate(`/edit/${post._id}`)}
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div className="whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection postId={post._id} />
    </div>
  );
}
import { useEffect, useState } from "react";
import type { Comment } from "../types";
import { commentsAPI } from "../services/api";
import { useAuth } from "../features/auth/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Send, Heart, Reply, Edit, Trash2 } from "lucide-react";
import Loader from "./Loader";

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentsAPI.getCommentsByPost(postId);
      setComments(res.data.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.createComment(postId, {
        content: content.trim(),
        parentId: replyingTo || undefined
      });
      setContent("");
      setReplyingTo(null);
      fetchComments();
      toast.success("Comment added!", { duration: 2000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment", { duration: 2000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      await commentsAPI.updateComment(commentId, { content: editContent.trim() });
      setEditingComment(null);
      setEditContent("");
      fetchComments();
      toast.success("Comment updated!", { duration: 2000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update comment", { duration: 2000 });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentsAPI.deleteComment(commentId);
      fetchComments();
      toast.success("Comment deleted!", { duration: 2000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment", { duration: 2000 });
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like comments", { duration: 2000 });
      return;
    }
    try {
      await commentsAPI.toggleLike(commentId);
      fetchComments();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setContent("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setContent("");
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = user && user._id === comment.author._id;
    const isLiked = user && comment.likes.includes(user._id);

    return (
      <div key={comment._id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm">{comment.author.username}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  {comment.isEdited && <span className="ml-1 text-gray-400">(edited)</span>}
                </div>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(comment)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {editingComment === comment._id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(comment._id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-gray-800 mb-3 whitespace-pre-wrap">{comment.content}</div>

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleLike(comment._id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isLiked
                      ? "text-red-500 bg-red-50"
                      : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }`}
                >
                  <Heart size={14} className={isLiked ? "fill-current" : ""} />
                  {comment.likes.length}
                </button>

                {!isReply && (
                  <button
                    onClick={() => startReply(comment._id)}
                    className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      )}

      {user && (
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={submitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {replyingTo && (
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel Reply
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !content.trim()}
              >
                <Send size={16} />
                {submitting ? "Posting..." : replyingTo ? "Reply" : "Comment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please login to leave a comment</p>
        </div>
      )}
    </div>
  );
}
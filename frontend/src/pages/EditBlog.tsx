import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postsAPI } from "../services/api";
import type { Post } from "../types";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { Image, Tag, X } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await postsAPI.getPostById(id!);
        const postData = res.data.data;
        setPost(postData);

        // Check if user is the author
        if (user?._id !== postData.author._id) {
          toast.error("You are not authorized to edit this post");
          navigate("/");
          return;
        }

        // Populate form
        setTitle(postData.title);
        setContent(postData.content);
        setTags(postData.tags.join(", "));
        if (postData.featuredImage) {
          setImagePreview(postData.featuredImage);
        }
      } catch (error) {
        toast.error("Post not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveCurrentImage(false);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("tags", tags);

      if (featuredImage) {
        formData.append("featuredImage", featuredImage);
      }

      if (removeCurrentImage) {
        formData.append("removeImage", "true");
      }

      const res = await postsAPI.updatePost(id!, formData);
      toast.success("Post updated successfully!");
      navigate(`/blog/${res.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your blog post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="featured-image" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload a featured image
                  </span>
                  <input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas (e.g., react, javascript, tutorial)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your blog post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? <Loader /> : "Update Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/blog/${id}`)}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

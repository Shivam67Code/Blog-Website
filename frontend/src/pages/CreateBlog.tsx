import { useState } from "react";
import { postsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { Image, Tag, X, FileText, Sparkles } from "lucide-react";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
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

      const res = await postsAPI.createPost(formData);
      toast.success("Blog post created successfully!");
      navigate(`/blog/${res.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create blog post");
    } finally {
      setSubmitting(false);
    }
  };

  const tagArray = tags.split(",").filter(t => t.trim()).map(t => t.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Create New Post</h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 ml-0 sm:ml-14">Share your thoughts with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Title Section */}
            <div className="p-4 sm:p-8 border-b border-slate-100">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Post Title
                  </label>
                  <input
                    type="text"
                    className="w-full text-xl sm:text-2xl font-bold border-0 px-0 py-2 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-300"
                    placeholder="Give your post an engaging title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Featured Image Section */}
            <div className="p-4 sm:p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Image className="w-5 h-5 text-slate-400" />
                <label className="block text-sm font-semibold text-slate-900">
                  Featured Image
                </label>
              </div>
              
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 sm:h-80 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-white text-slate-900 rounded-full p-3 hover:bg-slate-100 transition-colors shadow-xl"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="featured-image" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 sm:p-12 text-center hover:border-slate-400 hover:bg-slate-50 transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                      <Image className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG or GIF up to 10MB
                    </p>
                  </div>
                  <input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Tags Section */}
            <div className="p-4 sm:p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-5 h-5 text-slate-400" />
                <label className="block text-sm font-semibold text-slate-900">
                  Tags
                </label>
              </div>
              
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="javascript, react, web development"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              
              {tagArray.length > 0 && tagArray[0] && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tagArray.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-8">
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                Content
              </label>
              <textarea
                className="w-full min-h-[400px] sm:min-h-[500px] border-0 px-0 py-0 focus:outline-none focus:ring-0 text-base sm:text-lg text-slate-900 placeholder:text-slate-300 leading-relaxed resize-none"
                placeholder="Start writing your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <span className="text-xs text-slate-500">
                  {content.length} characters
                </span>
                <span className="text-xs text-slate-500">
                  ~{Math.ceil(content.split(/\s+/).filter(w => w).length / 200)} min read
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors text-center"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
              disabled={submitting}
            >
              {submitting ? <Loader /> : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
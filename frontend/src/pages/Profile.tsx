import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { postsAPI } from "../services/api";
import type { Post } from "../types";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";
import { User, Mail, Calendar, Edit, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "settings">("posts");

  const fetchMyPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await postsAPI.getMyPosts();
      const posts = res.data.data.posts || [];
      setMyPosts(posts);
      toast.success(`Posts loaded successfully (${posts.length} posts)`);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error(error.response?.data?.message || "Failed to load posts");
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Cover Image */}
        {user.coverImage && (
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.fullName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">@{user.username}</p>

              <div className="flex items-center gap-6 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Joined {format(new Date(user.createdAt), "MMM yyyy")}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit size={16} />
                  Edit Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "posts"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          My Posts ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "settings"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === "posts" ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Posts</h2>
            <button
              onClick={fetchMyPosts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {myPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-lg text-gray-500 mb-4">No posts yet</p>
                  <p className="text-gray-400">Start writing your first blog post!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.fullName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
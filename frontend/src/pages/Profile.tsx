import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { postsAPI } from "../services/api";
import type { Post } from "../types";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import SettingsModal from "../components/SettingsModal";
import Loader from "../components/Loader";
import { Mail, Calendar, Edit, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "settings">("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6">
        {/* Cover Image */}
        {user.coverImage && (
          <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-4 sm:px-6 pt-4 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative -mt-12 sm:-mt-14">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 w-full sm:pt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 break-words">
                {user.fullName}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mb-3 sm:mb-4">@{user.username}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm sm:text-base text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>Joined {format(new Date(user.createdAt), "MMM yyyy")}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors text-sm font-medium"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors text-sm font-medium"
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
            activeTab === "posts"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm"
          }`}
        >
          My Posts ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm"
          }`}
        >
          Account Info.
        </button>
      </div>

      {/* Content */}
      {activeTab === "posts" ? (
        <div>
          <div className="flex justify-between items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">My Posts</h2>
            <button
              onClick={fetchMyPosts}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {myPosts.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm">
                  <p className="text-base sm:text-lg text-slate-600 mb-2 font-medium">No posts yet</p>
                  <p className="text-sm sm:text-base text-slate-400">Start writing your first blog post!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {myPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.fullName}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50 text-slate-900 text-sm sm:text-base"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50 text-slate-900 text-sm sm:text-base"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50 text-slate-900 text-sm sm:text-base"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors font-medium text-sm sm:text-base"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
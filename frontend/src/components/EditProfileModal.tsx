import { useState } from "react";
import { userAPI } from "../services/api";
import { useAuth } from "../features/auth/AuthContext";
import { toast } from "sonner";
import { X, User, Mail, Camera, Upload } from "lucide-react";
import Loader from "./Loader";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "avatar" | "cover" | "password">("profile");

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Track changes for "Update All" functionality
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasPasswordChanges, setHasPasswordChanges] = useState(false);
  const [hasAvatarChanges, setHasAvatarChanges] = useState(false);
  const [hasCoverChanges, setHasCoverChanges] = useState(false);

  // Check if there are multiple changes
  const changeCount = [hasProfileChanges, hasPasswordChanges, hasAvatarChanges, hasCoverChanges].filter(Boolean).length;
  const showUpdateAll = changeCount > 1;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setHasAvatarChanges(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setHasCoverChanges(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Track profile changes
  const handleProfileFieldChange = (field: 'fullName' | 'email', value: string) => {
    if (field === 'fullName') {
      setFullName(value);
      setHasProfileChanges(value !== user?.fullName);
    } else {
      setEmail(value);
      setHasProfileChanges(value !== user?.email);
    }
  };

  // Track password changes
  const handlePasswordFieldChange = (field: 'oldPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'oldPassword') {
      setOldPassword(value);
    } else if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }
    setHasPasswordChanges(oldPassword !== '' || newPassword !== '' || confirmPassword !== '');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await userAPI.updateAccount({ fullName, email });
      updateUser(res.data.data);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!avatarFile) return;

    setLoading(true);
    try {
      const res = await userAPI.updateAvatar(avatarFile);
      updateUser(res.data.data);
      toast.success("Avatar updated successfully!");
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpdate = async () => {
    if (!coverFile) return;

    setLoading(true);
    try {
      const res = await userAPI.updateCoverImage(coverFile);
      updateUser(res.data.data);
      toast.success("Cover image updated successfully!");
      setCoverFile(null);
      setCoverPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update cover image");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword({ oldPassword, newPassword, confirmPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasPasswordChanges(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Update All functionality
  const handleUpdateAll = async () => {
    setLoading(true);
    const updates = [];
    let successCount = 0;

    try {
      // Update profile info
      if (hasProfileChanges) {
        try {
          const res = await userAPI.updateAccount({ fullName, email });
          updateUser(res.data.data);
          updates.push("Profile information");
          successCount++;
        } catch (error: any) {
          toast.error(`Failed to update profile: ${error.response?.data?.message || "Unknown error"}`);
        }
      }

      // Update avatar
      if (hasAvatarChanges && avatarFile) {
        try {
          const res = await userAPI.updateAvatar(avatarFile);
          updateUser(res.data.data);
          updates.push("Avatar");
          successCount++;
          setAvatarFile(null);
          setAvatarPreview(null);
          setHasAvatarChanges(false);
        } catch (error: any) {
          toast.error(`Failed to update avatar: ${error.response?.data?.message || "Unknown error"}`);
        }
      }

      // Update cover image
      if (hasCoverChanges && coverFile) {
        try {
          const res = await userAPI.updateCoverImage(coverFile);
          updateUser(res.data.data);
          updates.push("Cover image");
          successCount++;
          setCoverFile(null);
          setCoverPreview(null);
          setHasCoverChanges(false);
        } catch (error: any) {
          toast.error(`Failed to update cover image: ${error.response?.data?.message || "Unknown error"}`);
        }
      }

      // Update password
      if (hasPasswordChanges) {
        if (newPassword !== confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }
        try {
          await userAPI.changePassword({ oldPassword, newPassword, confirmPassword });
          updates.push("Password");
          successCount++;
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setHasPasswordChanges(false);
        } catch (error: any) {
          toast.error(`Failed to update password: ${error.response?.data?.message || "Unknown error"}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated: ${updates.join(", ")}`);
        setHasProfileChanges(false);
        if (successCount === changeCount) {
          onClose();
        }
      }
    } catch (error: any) {
      toast.error("Failed to update some changes");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            {showUpdateAll && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {changeCount} changes pending
                </span>
                <button
                  onClick={handleUpdateAll}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader /> : "Update All"}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Profile Info
              {hasProfileChanges && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("avatar")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === "avatar"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Avatar
              {hasAvatarChanges && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("cover")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === "cover"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Cover Image
              {hasCoverChanges && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === "password"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Password
              {hasPasswordChanges && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleProfileFieldChange('fullName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader /> : "Update Profile"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Avatar Tab */}
          {activeTab === "avatar" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <img src={user?.avatar} alt="Current avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Current avatar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Avatar
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={16} />
                    Choose Avatar
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              {avatarFile && (
                <div className="flex gap-4">
                  <button
                    onClick={handleAvatarUpdate}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader /> : "Update Avatar"}
                  </button>
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cover Image Tab */}
          {activeTab === "cover" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-full h-32 mb-4 rounded-lg overflow-hidden border border-gray-200">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : user?.coverImage ? (
                    <img src={user.coverImage} alt="Current cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No cover image
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">Current cover image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={16} />
                    Choose Cover Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              {coverFile && (
                <div className="flex gap-4">
                  <button
                    onClick={handleCoverUpdate}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader /> : "Update Cover Image"}
                  </button>
                  <button
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => handlePasswordFieldChange('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader /> : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { userAPI } from "../services/api";
import { useAuth } from "../features/auth/AuthContext";
import { toast } from "sonner";
import { X, Shield, Trash2, AlertTriangle, Key, Mail } from "lucide-react";
import Loader from "./Loader";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {  logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"security" | "danger">("security");

  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "token">("email");

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userAPI.forgotPassword(resetEmail);
      toast.success("Password reset token sent to your email", { duration: 2000 });
      setResetStep("token");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset token", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userAPI.resetPassword(resetToken, newPassword, confirmPassword);
      toast.success("Password reset successfully!", { duration: 2000 });
      setResetEmail("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setResetStep("email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm deletion", { duration: 2000 });
      return;
    }

    setLoading(true);
    try {
      await userAPI.deleteAccount(deletePassword);
      toast.success("Account deleted successfully", { duration: 2000 });
      logout();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Account Settings</h2>
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
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "security"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <Shield size={16} className="inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "danger"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <AlertTriangle size={16} className="inline mr-2" />
              Danger Zone
            </button>
          </div>

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key size={20} />
                  Password Reset
                </h3>
                <p className="text-gray-600 mb-4">
                  Reset your password using your email address. You'll receive a reset token via email.
                </p>

                {resetStep === "email" ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader /> : "Send Reset Token"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reset Token
                      </label>
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter the reset token from your email"
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
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your new password"
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
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm your new password"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader /> : "Reset Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetStep("email")}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 size={20} />
                  Delete Account
                </h3>
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <p className="text-red-600 text-sm mb-4">
                  This action will permanently delete your account and all associated data including:
                </p>
                <ul className="text-red-600 text-sm list-disc list-inside mb-4">
                  <li>All your blog posts</li>
                  <li>All your comments</li>
                  <li>Your profile information</li>
                  <li>All uploaded images</li>
                </ul>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-2">
                        Enter your password to confirm deletion
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading || !deletePassword}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? <Loader /> : "Permanently Delete Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword("");
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

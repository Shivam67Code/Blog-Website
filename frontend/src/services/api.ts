import axios from "axios";

const api = axios.create({
  baseURL: "https://blogwebsite-4wem.onrender.com/api/v1",
   headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add this interceptor:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API functions
export const userAPI = {
  // Auth
  register: (userData: FormData) => api.post("/users/register", userData),
  login: (credentials: { email?: string; username?: string; password: string }) =>
    api.post("/users/login", credentials),
  logout: () => api.post("/users/logout"),
  refreshToken: () => api.post("/users/refresh-token"),
  forgotPassword: (email: string) => api.post("/users/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    api.post(`/users/reset-password/${token}`, { token,newPassword, confirmPassword }),

  // User management
  getCurrentUser: () => api.get("/users/current-user"),
  updateAccount: (data: { fullName: string; email: string }) =>
    api.patch("/users/update-account-detail", data),
  changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post("/users/change-password", data),
  updateAvatar: (avatar: File) => {
    const formData = new FormData();
    formData.append("avatar", avatar);
    return api.patch("/users/update-avatar", formData);
  },
  updateCoverImage: (coverImage: File) => {
    const formData = new FormData();
    formData.append("coverImage", coverImage);
    return api.patch("/users/update-cover", formData);
  },
  getUserProfile: (username: string) => api.get(`/users/username-profile/${username}`),
  deleteAccount: (password: string) => api.delete("/users/delete-account", { data: { password } }),
  getAllUsers: () => api.get("/users/all-users"),
};

// Posts API functions
export const postsAPI = {
  // Public routes
  getAllPosts: (params?: { page?: number; limit?: number; tags?: string; search?: string }) =>
    api.get("/posts", { params }),
  getPostById: (postId: string) => api.get(`/posts/${postId}`),
  getPostsByAuthor: (authorId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/posts/author/${authorId}`, { params }),

  // Protected routes
  createPost: (postData: FormData) => api.post("/posts/create", postData),
  getMyPosts: (params?: { page?: number; limit?: number }) =>
    api.get("/posts/my-posts", { params }),
  updatePost: (postId: string, postData: FormData) =>
    api.patch(`/posts/${postId}/update`, postData),
  deletePost: (postId: string) => api.delete(`/posts/${postId}/delete`),
  toggleLike: (postId: string) => api.patch(`/posts/${postId}/like`),
};

// Comments API functions
export const commentsAPI = {
  // Public routes
  getCommentsByPost: (postId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/comments/post/${postId}`, { params }),
  getCommentById: (commentId: string) => api.get(`/comments/${commentId}`),

  // Protected routes
  createComment: (postId: string, data: { content: string; parentId?: string }) =>
    api.post(`/comments/post/${postId}`, data),
  updateComment: (commentId: string, data: { content: string }) =>
    api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
  toggleLike: (commentId: string) => api.post(`/comments/${commentId}/like`),
};

export default api;
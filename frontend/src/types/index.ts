export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  featuredImage?: string;
  tags: string[];
  author: User;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  parent?: string;
  likes: string[];
  isEdited: boolean;
  replies?: Comment[];
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPosts?: number;
  totalComments?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostsResponse {
  posts: Post[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationInfo;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
  register: (userData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}
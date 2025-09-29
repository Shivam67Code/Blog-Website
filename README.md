## 📜Blog Website - Full Stack Application

A modern, feature-rich blog website built with React (TypeScript) frontend and Node.js/Express backend with MongoDB database.

##  Features

### Authentication & User Management
- **User Registration** with avatar upload
- **Login/Logout** with email or username
- **Password Reset** via email tokens
- **Profile Management** with cover image support
- **JWT-based Authentication** with refresh tokens

### Blog Post Management
- **Create Blog Posts** with rich content, featured images, and tags
- **Edit/Delete Posts** (author-only access)
- **Search & Filter** posts by title, content, and tags
- **Pagination** for better performance
- **Like System** for posts

### Comment System
- **Nested Comments** with replies
- **Edit/Delete Comments** (author-only access)
- **Like Comments**
- **Real-time Updates**

### User Interface
- **Responsive Design** with Tailwind CSS
- **Modern UI Components** with Lucide React icons
- **Loading States** and error handling
- **Toast Notifications** for user feedback
- **Image Upload** with preview functionality

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **Sonner** for toast notifications
- **Lucide React** for icons
- **date-fns** for date formatting

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **Nodemailer** for email services
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

```
Blog-Website/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & file upload middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express app configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── features/       # Feature-specific code
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route configuration
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── package.json
└── README.md
```

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account (for image storage)
- Email service (for password reset)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/forgot-password` - Request password reset
- `POST /api/v1/users/reset-password/:token` - Reset password

### Posts
- `GET /api/v1/posts` - Get all posts (with pagination, search, tags)
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts/create` - Create new post (protected)
- `PATCH /api/v1/posts/:id/update` - Update post (protected)
- `DELETE /api/v1/posts/:id/delete` - Delete post (protected)
- `PATCH /api/v1/posts/:id/like` - Toggle like on post (protected)

### Comments
- `GET /api/v1/comments/post/:postId` - Get comments for a post
- `POST /api/v1/comments/post/:postId` - Create comment (protected)
- `PATCH /api/v1/comments/:id` - Update comment (protected)
- `DELETE /api/v1/comments/:id` - Delete comment (protected)
- `POST /api/v1/comments/:id/like` - Toggle like on comment (protected)

##  Key Features Implementation

### 1. Authentication System
- JWT-based authentication with refresh tokens
- Secure password hashing with bcryptjs
- Email-based password reset functionality
- Protected routes with middleware

### 2. File Upload System
- Multer middleware for handling file uploads
- Cloudinary integration for image storage
- Support for avatar and cover image uploads
- Featured image support for blog posts

### 3. Comment System
- Nested comment structure with replies
- Real-time comment updates
- Like functionality for comments
- Author-only edit/delete permissions

### 4. Search & Filter
- Full-text search across post titles and content
- Tag-based filtering
- Pagination for better performance
- Sorting by creation date

### 5. Responsive Design
- Mobile-first approach with Tailwind CSS
- Modern UI components with smooth animations
- Loading states and error handling
- Toast notifications for user feedback

## 🔧 Development

### Running in Development Mode
1. Start MongoDB service
2. Run backend: `cd backend && npm start`
3. Run frontend: `cd frontend && npm run dev`
4. Access the application at `http://localhost:5173`

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🤝 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Blogging! 🎉**

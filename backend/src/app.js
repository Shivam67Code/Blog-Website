import express, { urlencoded } from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser"
import postRouter from "./routes/post.routes.js"
import commentRouter from "./routes/comment.routes.js"

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes
import userRouter from "./routes/user.routes.js";
import { defaultRoute, healthRoute } from './routes/default.routes.js';
import { log } from 'console';
app.use("/api/v1/users", userRouter);
console.log("userRouter mounted at /api/v1/users");

// app.get('/health', healthRoute)
app.get("/", defaultRoute)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/comments", commentRouter)

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} NOT Found`,
    error: "NOT FOUND"
  })
})

//Global error handler
app.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error ",
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  })
})

export { app }
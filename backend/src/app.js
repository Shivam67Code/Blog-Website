import express, { urlencoded } from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser"

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
import userRouter from './routes/user.routes.js'
import { defaultRoute, healthRoute } from './routes/default.routes.js';
app.use("/api/v1/users", userRouter)
app.get('/health', healthRoute)
app.get("/", defaultRoute)

// // 404 handler for unmatched routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   })
// })

export { app }
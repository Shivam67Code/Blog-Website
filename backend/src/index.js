import express from 'express'
import { connectDB } from "./db/db.js";
import { app } from "./app.js"
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error : ", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server is running at http://localhost:${process.env.PORT || 8000}`
      );
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });

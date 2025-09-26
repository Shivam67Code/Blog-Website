import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path: './.env'
});

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(`🌿 MONGODB CONNECTED SUCCESSFULLY !!! ☘️`);
    console.log(`DB HOST: ${connectionInstance.connection.host}`);
    console.log(` DB NAME: ${connectionInstance.connection.name}`);

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};


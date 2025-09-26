import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("File uploaded to cloudinary successfully !", response.url);
    fs.unlinkSync(localFilePath)
    return response

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove locally saved temp as upload operation failed
    return null;
  }
}

const deleteFromCloudinary = async (imageURL) => {
  try {
    if (!imageURL) return null;
    const publicId = imageURL.split("/").pop().split('.')[0]
    console.log("The public ID from cloudinary is : ", publicId)

  } catch (error) {
    console.log("Error deleting from Cloudinary, ", error);
    return null;
  }
}

export { uploadOnCloudinary, deleteFromCloudinary }
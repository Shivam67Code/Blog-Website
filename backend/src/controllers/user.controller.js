import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
  // get the details
  const { fullName, username, email, password } = req.body;
  console.log("=== DEBUG INFO ===")
  console.log("req.files:", req.files)
  console.log("req.body:", req.body)
  console.log("==================")


  // check all the fields
  if ([fullName, username, email, password].some((field) =>
    field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required !! ")
  }

  console.log("Email is : ", email)


  //check the format  -> a basic regex
  if (!email.includes("@") || !email.includes(".com")) {
    throw new ApiError(400, "Please,Enter a valid Email")
  }

  // check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  console.log("The already existing user is : ", existedUser)
  if (existedUser) {
    throw new ApiError(409, "THe user with username or email already exists")
  }

  let avatarLocalPath;
  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path
  }
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverimage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required")
  }

  // if there is avatar then upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar File is required")
  }

  // create user from User.create
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  })

  // check if user created or not
  const checkUserCreation = await User.findById(user._id).select("-password -refreshToken")

  if (!checkUserCreation) {
    throw new ApiError(500, "SOmething went wrong while Registrating/creating User. ")
  }
  //  send the response
  return res
    .status(200)
    .json(new ApiResponse(200, checkUserCreation, "User Registered Successfully"))

})

export { registerUser }
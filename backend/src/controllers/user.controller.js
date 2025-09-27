import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
  // get the details
  const { fullName, username, email, password } = req.body;
  // debug consoles
  // console.log("=== DEBUG INFO ===")
  // console.log("req.files:", req.files)
  // console.log("req.body:", req.body)
  // console.log("==================")


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
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
const generateRefreshAndAccessToken = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError(404, "No User Id found")
    }
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // // set firts
    // user.refreshToken = refreshToken
    // // now save
    // await user.save({ validateBeforeSave: false })
    // Either do these two steps or just do the following 
    await User.findByIdAndUpdate(userId, { refreshToken })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens ");
  }

}

const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===")
    console.log("Request body:", req.body)
    console.log("Username:", req.body.username)
    console.log("Email:", req.body.email)

    if (!req.body) {
      throw new ApiError(400, "Request Body is empty/Undefined")
    }
    // find the username and email and other things from req.body
    const { email, fullName, password, username } = req.body;
    //username and email is required
    if (!username && !email) {
      throw new ApiError(409, "Username and Email are Required For loggin In.")
    }

    console.log('PASSWORD IS : ', password)
    // find the user and if not exists the give error message 
    const user = await User.findOne({
      $or: [{ username }, { email }]
    })
    if (!user) {
      throw new ApiError(404, "User doesn't Exists")
    }

    // // validate password
    // const isPasswordValid = await user.isPasswordCorrect(password)
    // if (!isPasswordValid) {
    //   throw new ApiError(401, "Incorrect Password")
    // }
    // set access and refresh tokens
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    // find loggedInUser
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // set options
    const options = {
      httpOnly: true,
      secure: true
    }
    // send resposne
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In SUCCESSFULLY")
      )
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    console.error("Error stack:", error.stack)
    throw error
  }
})

const logOutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true // to make sure the resposne we get is new
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refershToken

  if (incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateRefreshAndAccessToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token Refreshed")
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")

  }
})


export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken
}
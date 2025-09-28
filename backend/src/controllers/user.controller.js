import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const registerUser = asyncHandler(async (req, res) => {
  // get the details
  const { fullName, username, email, password } = req.body;

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
    // // now save the refreshToken
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
    // console.log("=== LOGIN DEBUG ===")
    // console.log("Request body:", req.body)

    if (!req.body) {
      throw new ApiError(400, "Request Body is empty/Undefined")
    }

    const { email, password, username } = req.body;

    if (!username && !email) {
      throw new ApiError(409, "Username and Email are Required For loggin In.")
    }

    const user = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (!user) {
      throw new ApiError(404, "User doesn't Exists")
    }

    // Validate password
    // validate password if provided
    if (password) {
      const isPasswordValid = await user.isPasswordCorrect(password)
      if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
      }
    } else {
      throw new ApiError(400, "Password is required For loggin In !! .")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In SUCCESSFULLY")
      )
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    throw error
  }
})

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
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
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request, Refresh Token Required ! ")
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

    const { accessToken, refreshToken: newRefreshToken } = await generateRefreshAndAccessToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed")
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
  }
})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields (oldPassword, newPassword, confirmPassword) are required")
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New Password and Confirm password do not Match !!")
  }

  const user = await User.findById(req.user._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user Details Fetched"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body

  if (!fullName || !email) {
    throw new ApiError(400, "Email or fullName are not provided")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated SuccessFully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image Updated SuccessFully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover Image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated SuccessFully"))
})

const getUserProfileByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(404, "Username is missing")
  }

  const user = await User.findOne({
    username: username.toLowerCase()
  }).select("-password -refreshToken")

  if (!user) {
    throw new ApiError(404, "User not Found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Fetched Successfully"))
})

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  if (!password) {
    throw new ApiError(400, "Password is required to delete account")
  }

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(password)

  if (!isPasswordCorrect) {
    throw new ApiError(409, "Incorrect Password ")
  }

  await User.findByIdAndDelete(req.user._id)

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Account Deleted SuccessFully"))
})

const getAllUsers = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()

  const users = await User.find({})
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, { users, totalUsers }, "All Users Fetched SuccessFully"))
})

// FORGOT PASSWORD - Complete Implementation
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user) {
    throw new ApiError(404, "User with this email does not exist")
  }

  // Generate reset token using the model method
  const resetToken = user.generatePasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // Create reset message
  const message = `
    Hi ${user.fullName},
    
    You requested a password reset for your Blog Website account.
    
    Your password reset token is: ${resetToken}
    
    This token will expire in 10 minutes.
    
    If you didn't request this, please ignore this email.
    
    Best regards,
    Blog Website Team
  `

  const htmlMessage = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>You requested a password reset for your Blog Website account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px dashed #007bff;">
          <h3 style="margin: 0; color: #007bff;">Your Reset Token</h3>
          <p style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0; letter-spacing: 2px;">${resetToken}</p>
        </div>
      </div>
      <p><strong>⚠️ This token will expire in 10 minutes.</strong></p>
      <p>Use this token in the reset password form to create a new password.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px; text-align: center;">Best regards,<br>Blog Website Team</p>
    </div>
  `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token - Blog Website',
      message,
      html: htmlMessage,
    })

    res.status(200).json(
      new ApiResponse(200, {}, 'Password reset token sent to email successfully')
    )
  } catch (error) {
    // Clear the reset token if email sending fails
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    console.error('Email sending error:', error)
    throw new ApiError(500, 'Email could not be sent. Please try again later.')
  }
})

// RESET PASSWORD - Complete Implementation
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body

  console.log("=== RESET PASSWORD DEBUG ===")
  console.log("Received token:", token)
  console.log("Current time:", Date.now())

  if (!token || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required")
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match")
  }

  // Hash the token to compare with stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  console.log("Hashed token for search:", hashedToken)

  // Find user with valid reset token and check if not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  console.log("Found user:", user ? "Yes" : "No")

  // Let's also check if token exists without time constraint
  const userWithToken = await User.findOne({ passwordResetToken: hashedToken })
  console.log("User with token (no time check):", userWithToken ? "Yes" : "No")

  if (userWithToken) {
    console.log("Token expiry time:", userWithToken.passwordResetExpires)
    console.log("Is expired?", userWithToken.passwordResetExpires < Date.now())
  }

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token")
  }

  // Update password and clear reset token fields
  user.password = newPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Send confirmation email
  const confirmationMessage = `
    Hi ${user.fullName},
    
    Your password has been successfully reset for your Blog Website account.
    
    You can now log in with your new password.
    
    If this wasn't you, please contact our support team immediately.
    
    Best regards,
    Blog Website Team
  `

  const confirmationHtml = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #28a745; text-align: center;">Password Reset Successful</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>Your password has been successfully reset for your Blog Website account.</p>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
        <p style="margin: 0; color: #155724;"><strong>Success!</strong> You can now log in with your new password.</p>
      </div>
      <p>If this wasn't you, please contact our support team immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px; text-align: center;">Best regards,<br>Blog Website Team</p>
    </div>
  `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful - Blog Website',
      message: confirmationMessage,
      html: confirmationHtml,
    })
  } catch (error) {
    console.log('Confirmation email could not be sent:', error)
    // not throwing error here as password is already reset
  }

  res.status(200).json(
    new ApiResponse(200, {}, "Password reset successfully")
  )
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfileByUsername,
  deleteAccount,
  getAllUsers,
  forgotPassword,
  resetPassword
}
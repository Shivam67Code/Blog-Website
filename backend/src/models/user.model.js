import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from 'crypto'


const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, // will use cloudinary to get string(URL)
      required: true,
    },
    coverImage: {
      type: String
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  }, { timestamps: true }
)



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

// Add debugging to this method
userSchema.methods.generatePasswordResetToken = function () {
  // Generate 6-digit reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  console.log("=== MODEL DEBUG ===")
  console.log("Plain token generated:", resetToken)

  // Hash the token before saving to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log("Hashed token:", this.passwordResetToken)

  // Set expiry time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log("Expiry set to:", this.passwordResetExpires)

  // Return unhashed token (to send via email)
  return resetToken;
}


export const User = mongoose.model("User", userSchema)
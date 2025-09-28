import mongoose, { Schema } from "mongoose"

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      deafult: null
    }
  },
  { timestamps: true }

)


export const Comment = mongoose.model("Comment", commentSchema)
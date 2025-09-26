import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
      trim: true
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    featuredImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      deafult: "draft"
    },
    categories: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    readTime: {
      type: Number, // minute me lebai time
      default: 0
    },
    views: {
      type: Number,
      deafult: 0
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      timestamps: true
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    metaDescription: {
      type: String,
      maxlength: 160,
      trim: true
    },
    metaKeywords: [{
      type: String,
      trim: true
    }]
  }, { timestamps: true }
)
// indexes
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ status: 1, published: -1 })
postSchema.index({ slug: 1 })
postSchema.index({ tags: 1 })
postSchema.index({ categories: 1 })

postSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
  }
  // TO find REad time
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length
    this.readTime = Math.ceil(wordCount / 200)
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
    this.isPublished = true
  }
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 300)
      .trim()
  }

  next()


})

postSchema.methods.incrementViews = function () {
  this.views += 1
  return this.save()
}

postSchema.methods.addLike = function (userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId)
  }
  return this.save()
}

postSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter(id => !id.equals(userId))
}
postSchema.methods.addComment = function (userId, content) {
  this.comments.push({
    user: userId,
    content: content
  })
}
postSchema.virtual('likeCount').get(function () {
  return this.likes.length
})
postSchema.virtual('commentCount').get(function () {
  return this.comments.length
})

postSchema.set('toJson', { virtuals: true })

export const Post = mongoose.model("Post", postSchema)
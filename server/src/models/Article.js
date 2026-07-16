import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      minlength: [5, "Title must contain at least 5 characters."],
      maxlength: [180, "Title cannot exceed 180 characters."],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    summary: {
      type: String,
      required: [true, "Summary is required."],
      trim: true,
      minlength: [20, "Summary must contain at least 20 characters."],
      maxlength: [500, "Summary cannot exceed 500 characters."],
    },

    content: {
      type: String,
      required: [true, "Content is required."],
      minlength: [50, "Content must contain at least 50 characters."],
    },

    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    currentVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

articleSchema.index({ publisher: 1, createdAt: -1 });
articleSchema.index({ status: 1, publishedAt: -1 });

export const Article = mongoose.model("Article", articleSchema);
import mongoose from "mongoose";

const articleVersionSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },

    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sourceContribution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
      default: null,
    },

    changeType: {
      type: String,
      enum: ["initial", "manual_edit", "accepted_contribution"],
      required: true,
    },

    changeDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  }
);

articleVersionSchema.index(
  {
    article: 1,
    versionNumber: 1,
  },
  {
    unique: true,
  }
);

articleVersionSchema.index({ article: 1, createdAt: -1 });

articleVersionSchema.index(
  { sourceContribution: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export const ArticleVersion = mongoose.model(
  "ArticleVersion",
  articleVersionSchema
);
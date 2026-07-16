import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
      immutable: true,
    },

    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      immutable: true,
    },

    baseVersion: {
      type: Number,
      required: true,
      min: 1,
      immutable: true,
    },

    originalContent: {
      type: String,
      required: true,
      immutable: true,
    },

    proposedContent: {
      type: String,
      required: true,
      minlength: [
        50,
        "Proposed content must contain at least 50 characters.",
      ],
    },

    message: {
      type: String,
      required: [true, "Contribution message is required."],
      trim: true,
      minlength: [
        10,
        "Contribution message must contain at least 10 characters.",
      ],
      maxlength: [
        1000,
        "Contribution message cannot exceed 1000 characters.",
      ],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "changes_requested",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "pending",
      index: true,
    },

    reviewComment: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Review comment cannot exceed 1000 characters.",
      ],
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    resubmissionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contributionSchema.index({
  article: 1,
  status: 1,
  createdAt: -1,
});

contributionSchema.index({
  contributor: 1,
  createdAt: -1,
});

contributionSchema.index({
  article: 1,
  contributor: 1,
  status: 1,
});

export const Contribution = mongoose.model(
  "Contribution",
  contributionSchema
);
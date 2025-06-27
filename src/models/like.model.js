import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet"
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

export const Like = mongoose.model("Like", likeSchema);

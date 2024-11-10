import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }
  
    // Check if the user already liked the video
    const existingLike = await Like.findOne({ likedBy: req.user.id, video: videoId });
  
    if (existingLike) {
      // Unlike video 
     await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json(new ApiResponse(200, "Video unliked"));
    } else {
      // Like video
      const newLike = await Like.create({
        likedBy: req.user.id, // user ID from authenticated user
        video: videoId 
      });
      return res.status(201).json(new ApiResponse(201, newLike, "Video liked"));
    }
  });
 
// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // const videoId = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const like = await Like.findOne({ likedBy: req.user.id, comment :commentId });

    if (like) {
      const likeCommentDeleteDetails =   await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, likeCommentDeleteDetails , "Comment unliked"));
    } else {
      const likeCommentCraitedDetails =   await Like.create({ likedBy: req.user.id, comment :commentId });
        return res.status(201).json(new ApiResponse(201,likeCommentCraitedDetails, "Comment liked"));
    }
});

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const like = await Like.findOne({ likedBy: req.user.id, tweet:  tweetId });

    if (like) {
        const likeTweetDeleteDetails =   await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, likeTweetDeleteDetails ,"Tweet unliked"));
    } else {
        const likeTweetCraitedDetails =  await Like.create({ likedBy: req.user.id, tweet:  tweetId });
        return res.status(201).json(new ApiResponse(201, likeTweetCraitedDetails ,"Tweet liked"));
    }
});

// Get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user.id, video: { $exists: true } }).populate("video");
    return res.status(200).json(new ApiResponse(200, likes)); 
});
// Get all liked comments 
const getLikedComments = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user.id ,  comment: { $exists: true } }).populate("comment");
    return res.status(200).json(new ApiResponse(200, likes)); 
});
// Get all liked tweets 
const getLikedTweets = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user.id ,  tweet: { $exists: true } }).populate("tweet");
    return res.status(200).json(new ApiResponse(200, likes)); 
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
};

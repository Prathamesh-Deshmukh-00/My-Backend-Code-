import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from 'mongoose';


// Get all comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Use mongoose-aggregate-paginate-v2 for pagination
    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([
            { $match: { video: new mongoose.Types.ObjectId(videoId)
            } }, // Match comments related to the video
            {
                $lookup: { // Populate owner field with user information
                    from: "User",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            }
        ]),
        { page, limit }
    );

    res.status(200).json(new ApiResponse(comments));
});

// Add a comment to a specific video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user ID is available in req.user

    if (!content) {
        throw new ApiError("Content is required", 400);
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    });

    res.status(201).json(new ApiResponse(comment, "Comment added successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId }, // Only allow the owner to update their comment
        { content },
        { new: true }
    );

    if (!comment) {
        throw new ApiError("Comment not found or you don't have permission to update it", 404);
    }

    res.status(200).json(new ApiResponse(comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOneAndDelete({ _id: commentId, owner: userId });

    if (!comment) {
        throw new ApiError("Comment not found or you don't have permission to delete it", 404);
    }

    res.status(200).json(new ApiResponse(null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};

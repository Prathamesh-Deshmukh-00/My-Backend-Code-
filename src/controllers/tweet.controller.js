import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res, next) => {
    // Extract content from request body
    const { content } = req.body;

    // Check if content is provided, return 400 Bad Request if not
    if (!content) {
        return next(new ApiError(400, "Content is required to create a tweet"));
    }

    // Create a new tweet record in the database
    const tweetDetails = await Tweet.create({
        owner: req.user._id, // tweet owner ID from authenticated user (assuming req.user is set by auth middleware)
        content
    });

    // Check if tweet details were successfully saved in the database
    if (!tweetDetails) {
        return next(new ApiError(500, "Something went wrong while storing tweet details")); // 500 Internal Server Error if save fails
    }

    // Return success response with the created tweet details
    return res.status(201).json(
        new ApiResponse(201, tweetDetails, "Tweet created successfully") // 201 Created response
    );
});

const getUserTweets = asyncHandler(async (req, res, next) => {
    // Get the user ID from the route parameters
    const { userId } = req.params;
    
    // Fetch all tweets by the user (owner) from the database
    const tweetsDetails = await Tweet.find({ owner: userId });

    // Log the fetched tweet details for debugging
    console.log("This is tweets: ", tweetsDetails);

    // Check if tweets were found
    if (!tweetsDetails || tweetsDetails.length === 0) {
        return next(new ApiError(404, "No tweets found for this user")); // 404 Not Found if no tweets exist
    }

    // Return success response with the fetched tweet details
    return res.status(200).json(
        new ApiResponse(200, tweetsDetails, "Tweets fetched successfully") // 200 OK response
    );
});

const updateTweet = asyncHandler(async (req, res, next) => {
    // Get the tweet ID from the route parameters
    const { tweetId } = req.params;
    console.log("tweet id is: - ", tweetId);

    // Get the content from the request body
    const { content } = req.body;

    // Ensure content is provided
    if (!content) {
        return next(new ApiError(400, "Content is required to update the tweet"));
    }

    // Find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);

    // If the tweet doesn't exist, return a 404 error
    if (!tweet) {
        return next(new ApiError(404, "Tweet not found"));
    }

    // Check if the logged-in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "You are not authorized to update this tweet"));
    }

    // Update the tweet's content
    tweet.content = content;
    const updatedTweet = await tweet.save();

    // Return the updated tweet
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});


const getTweets = asyncHandler(async(req,res)=>{
    const { tweetId } = req.params; // Destructure correctly based on the route
const tweet = await Tweet.findById(tweetId);

if (!tweet) {
    return res.status(404).json({ message: "Tweet not found" });
}

   // Send the updated tweet details in the response
   return res.status(200).json(
    new ApiResponse(200, tweet, "Tweet feched successfully") // 200 OK response with the updated tweet
);

})

const deleteTweet = asyncHandler(async (req, res, next) => {
    // Get the tweet ID from the route parameters
    const { tweetId } = req.params;
    console.log("tweet id is: - ", tweetId);
    // Step 1: Find the tweet by its ID and delete it
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    // If the tweet was not found, return a 404 error
    if (!deletedTweet) {
        return next(new ApiError(404, "Tweet not found")); // 404 Not Found if the tweet doesn't exist
    }

    // Return success response after deletion
    return res.status(200).json(
        new ApiResponse(200, deletedTweet, "Tweet deleted successfully") // 200 OK response with the deleted tweet
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweets
}
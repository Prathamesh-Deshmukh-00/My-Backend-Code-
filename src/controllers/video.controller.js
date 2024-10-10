import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // Extract query parameters from the request
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // Step 1: Build a search filter for videos
    let filter = {};

    // If a search query is provided, match against the title or description
    if (query) {
        filter = {
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive search on title
                { description: { $regex: query, $options: 'i' } } // Case-insensitive search on description
            ]
        };
    }

    // If a specific user ID is provided, filter by user (to get videos uploaded by that user)
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId; // Filter by user ID
    }

    // Step 2: Determine sorting options
    const sortOptions = {
        [sortBy]: sortType === 'asc' ? 1 : -1 // Sort based on sortType (ascending or descending)
    };

    // Step 3: Fetch videos from the database with pagination and sorting
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit) // Pagination: skip items for previous pages
        .limit(Number(limit)) // Limit the number of results per page
        .populate('owner', 'name email') // Populate owner details with name and email

    // Step 4: Get total count for pagination metadata
    const totalVideos = await Video.countDocuments(filter);

    // Step 5: Construct response with pagination data
    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            pagination: {
                total: totalVideos,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVideos / limit),
                pageSize: Number(limit),
            }
        }, "Videos fetched successfully")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    // Extract the title and description from the request body
    const { title, description } = req.body;

    // Step 1: Get the video and thumbnail file paths from the uploaded files
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    // Step 2: Check if both video and thumbnail files are provided
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video or thumbnail file is missing"); // 400 Bad Request for missing files
    }

    // Step 3: Upload video and thumbnail to Cloudinary
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // Step 4: Check if the video upload was successful
    if (!video.url) {
        throw new ApiError(500, "Error while uploading video to Cloudinary"); // 500 Internal Server Error for upload failure
    }

    // Step 5: Check if the thumbnail upload was successful
    if (!thumbnail.url) {
        throw new ApiError(500, "Error while uploading thumbnail to Cloudinary"); // 500 Internal Server Error for upload failure
    }

    // Step 6: Create a new video record in the database
    const videoDetails = await Video.create({
        owner: req.user._id, // Video owner ID from authenticated user
        videoFile: video.url, // Video URL from Cloudinary
        isPublish: true, // Set video to published (you can modify this based on your requirements)
        views: 0, // Initialize views to 0
        duration: video.duration, // Assuming Cloudinary returns video duration
        description, // Video description from request
        thumbnail: thumbnail.url, // Thumbnail URL from Cloudinary
        title // Video title from request
    });

    // Step 7: Check if video details were successfully saved in the database
    if (!videoDetails) {
        throw new ApiError(500, "Something went wrong while storing video details"); // 500 Internal Server Error if save fails
    }

    // Step 8: Return success response with the created video details
    return res.status(201).json(
        new ApiResponse(201, videoDetails, "Video details saved successfully") // 201 Created response
    );
});


const getVideoById = asyncHandler(async (req, res) => {
    // Extract video ID from request parameters
    const { videoId } = req.params;

    // Step 1: Search for the video in the database using the video ID
    const video = await Video.findById(videoId);

    // Step 2: Check if the video exists
    if (!video) {
        throw new ApiError(404, "Video not found"); // Use 404 status code for "Not Found"
    }

    // Step 3: Send the found video in the response
    return res.status(200).json(new ApiResponse(200, video, "Video found successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    // Extract the video ID from the request parameters
    const { videoId } = req.params;
    
    // Step 1: Extract video details (thumbnail, description, title) from request body
    const { description, title } = req.body;

    // retrive thumbnail file path from user
    const thumbnailLocalPath = req.file?.path
 
   // check thumbnail path is exist or not 
   if(!thumbnailLocalPath){
      throw new ApiError(400,"Thumbnail file is missing. please upload thumbnail file");
   }
 
   // upload  thumbnail on cloudinary 
   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

   // check url in response recive from cloudinary
   if(!thumbnail.url){
      throw new ApiError(400, "Error while uploading thumbnail ")
   }

    // Step 2: Get the user ID from the authenticated user in the request
    const userId = req.user._id;

    // Step 3: Fetch the video from the database using the video ID
    const video = await Video.findById(videoId);

    // Step 4: Check if the video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Step 5: Check if the authenticated user is the owner of the video
    if (userId.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the video owner can update the video details");
    }

    // Step 6: Ensure that all fields are provided in the request body
    if (!description || !title) {
        throw new ApiError(400, "All fields ( description, title) are required");
    }

    // Step 7: Update the video details in the database
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                thumbnail : thumbnail.url,
                description,
            }
        },
        { new: true } // Return the updated document
    );

    // Step 8: Send the updated video details in the response
    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video details updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    // Extract the video ID from the request parameters
    const { videoId } = req.params;

    // Step 1: Get the user ID from the authenticated user in the request
    const userId = req.user._id;

    // Step 2: Fetch the video from the database using the video ID
    const video = await Video.findById(videoId);

    // Step 3: Check if the video exists
    if (!video) {
        throw new ApiError(404, "Video not found"); // 404 Not Found if video doesn't exist
    }

    // Step 4: Check if the authenticated user is the owner of the video
    if (userId.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the video owner can delete the video"); // 403 Forbidden if user is not the owner
    }

    // Step 5: Delete the video from the database
    await Video.findByIdAndDelete(videoId); // Use findByIdAndDelete instead

    // Step 6: Send success response after deletion
    return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    // Extract the video ID from the request parameters
    const { videoId } = req.params;

    // Step 1: Get the user ID from the authenticated user in the request
    const userId = req.user._id;

    // Step 2: Fetch the video from the database using the video ID
    const video = await Video.findById(videoId);

    // Step 3: Check if the video exists
    if (!video) {
        throw new ApiError(404, "Video not found"); // 404 Not Found if video doesn't exist
    }

    // Step 4: Check if the authenticated user is the owner of the video
    if (userId.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Only the video owner can update the publish status"); // 403 Forbidden if user is not the owner
    }

    // Step 5: Toggle the `isPublish` status (flip true to false or vice versa)
    const updatedStatus = !video.isPublish;

    // Step 6: Update the `isPublish` status in the database
    await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublish: updatedStatus } },
        { new: true } // Return the updated document
    );

    // Step 7: Send success response
    return res.status(200).json(new ApiResponse(200, null, "Video publish status toggled successfully"));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
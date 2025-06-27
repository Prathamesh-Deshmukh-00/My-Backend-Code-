import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { Name, description } = req.body;
    const userId = req.user._id;

    console.log("user id while create playlist", userId);
    // Step 1: Check if playlist already exists for the user
    const existingPlaylist = await Playlist.findOne({ Name, Owner: userId });

    if (existingPlaylist) {
        throw new ApiError(400, "A playlist with this name already exists for this user.");
    }

    // Step 2: Create a new playlist
    const playlist = await Playlist.create({
        Owner: userId,
        Name,
        description,
    });

    // Step 3: Check if the playlist creation was successful
    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist. Please try again.");
    }

    // Step 4: Return success response with the created playlist details
    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    // console.log("user id from auth middelware" , req.user._id);

    // console.log("Fetching playlists for user:", userId); // Log user ID

    // Step 1: Search for the user's playlists and populate video and owner details
    const ownerPlaylists  = await Playlist.find({ Owner: req.user.id, video: { $exists: true } }).populate("video");// Populate Owner fields (name, email) from the User model

    // console.log("Playlists fetched:", ownerPlaylists.length); // Log the number of playlists found

    // Step 2: Check if any playlists exist
    if (ownerPlaylists.length === 0) {
        throw new ApiError(404, "No playlists found for this user"); // Use 404 status code for "Not Found"
    }

    // Step 3: Send the found playlists in the response
    return res.status(200).json(new ApiResponse(200, ownerPlaylists, "Playlists found successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const  playlist = await Playlist.findOne({_id : playlistId })
   
    if(!playlist){
        new ApiError(404,"playlist not found on provied id ");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist details fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlistId and videoId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, `Invalid playlist ID: ${playlistId}`);
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, `Invalid video ID: ${videoId}`);
    }

    // Step 1: Find the playlist by its ID
    const playlist = await Playlist.findById(playlistId);

    // If the playlist is not found, throw a 404 error
    if (!playlist) {
        throw new ApiError(404, `Playlist with ID ${playlistId} not found.`);
    }

    const checkplaylistexists = await Playlist.find({video:videoId})

    if(checkplaylistexists){
        throw new ApiError(400, `Video with ID ${videoId} already exists in this playlist `)
    }
    // Step 2: Add the video to the playlist if it's not already in the array
   const updatedplaylist =  await Playlist.findByIdAndUpdate(
        playlistId, 
        { $addToSet: { video: videoId } },  // Add video to playlist using $addToSet to prevent duplicates
        { new: true }  // Return the updated playlist
    );

    if(!updatePlaylist){
        throw new ApiError(500, "Failed to add video id in playlist");
    }
    // // Step 3: Retrieve the updated playlist and populate the video details
    // const updatedPlaylistWithVideos = await Playlist.findById(playlistId).populate({
    //     path: 'video', // Populate video field
    //     select: 'title videoFile' // Assuming your video model has 'title' and 'link' fields
    // });

    // Step 4: Return the updated playlist with populated video details as the response
    return res.status(200).json(new ApiResponse(200, updatedplaylist, "Video added to playlist successfully."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

// Method to generate access and refresh tokens
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    // Find user using userId
    const user = await User.findById(userId);
    
    // Handle case where user is not found
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return tokens
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;

  // Check if all fields are provided
  if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check if avatar and coverImage are provided
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload avatar and coverImage to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  // Create user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  });

  // Remove password and refreshToken from the response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // Check if user creation was successful
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return API response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  // Check if username or email is provided
  if (!userName && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ userName }, { email }]
  });

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

  // find user and retrive data from user without password and refreshToken
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Set cookie options
//   const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: true
  };

  // Return response with cookies and user data
  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  // Remove refreshToken from user in database
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: undefined }
  }, { new: true });

  // Set cookie options
//   const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: true
  };

  // Clear cookies and return success response
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // Save user refresh token in variable
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // Check if token is available
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Decode token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user by decoded token's user ID
    const user = await User.findById(decodedToken?._id);

    // Check if user exists
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if refresh token matches
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Set cookie options
   //  const isProduction = process.env.NODE_ENV === 'production';
    const options = {
      httpOnly: true,
      secure: true
    };

    // Generate new access and refresh tokens
    const { accessToken: newaccessToken, refreshToken: newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    // Return new tokens to user
    return res.status(200)
      .cookie("accessToken", newaccessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: newaccessToken, refreshToken: newrefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});


// change current password
const changeCurrentPassword = asyncHandler(async(req,res)=>{
   // retrive data from req.body 
   const {oldPassword , newPassword} = req.body

   // find user using user id of user (user id retrive from req.user?._id )
   const user = await User.findById(req.user?._id);

   //check is password is correct or not 
   const isPasswordcorrect = await user.isPasswordCorrect(oldPassword);

   if(!isPasswordcorrect){
     throw new ApiError(400 , "enter invilid password");
   }
    
   // set new password 
  user.password = newPassword

  //save updated password 
  await user.save({validateBeforeSave: false})

  // return 200(Password changed successfully) response to user
  return res.status(200).json(new ApiResponse(200, {} , "Password changed successfully"))
})

// get current user 
const getCurrentuser = asyncHandler(async(req,res)=>{
   //return current user (return req.user those allready added in middleware)
   return res.status(200).json(200, req.user , "current user fetch succussfully ")
})

//update account details 
const updateAccountDetails = asyncHandler(async(req,res)=>{
  
   // retrive data from req.body 
   const {fullName , email} = req.body 
   
   //check all fileds are provied by user or not 
   if(!fullName || !email){
      throw new ApiError(400 , "All feilds are required")
   }

   // update all provided filds and store in user variable and Db 
 const user =  user.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            fullName,
            email
         }
      },
      {new:true}
   ).select("-password")

    //return response 200 to user with updated data
   return res.status(200).json(new ApiResponse(200,user , "updated succussfully"))

})


// update avatar 
const updateUserAvatar = asyncHandler(async(req,res)=>{
   // retrive file path from user
   const avatarLocalPath = req.file?.path
 
   // check path is exist or not 
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing");
   }
 
   // upload  avatar on cloudinary 
   const avatar = await uploadOnCloudinary(avatarLocalPath);

   // check url in response recive from cloudinary
   if(!avatar.url){
      throw new ApiError(400, "Error while uploading on avatar ")
   }

   //update avatar url in DB 
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar: avatar.url
         }
      },
      {new : true}
   ).select("-password")

   // response to user 
   return res.status(200).json(new ApiResponse(200,user , "updated avatar succussfully"))
})


// update cover Image  
const updateUsearCoverImage = asyncHandler(async(req,res)=>{

   // retrive file path from user
   const coverImageLocalPath = req.file?.path
 
   // check path is exist or not 
   if(!coverImageLocalPath){
      throw new ApiError(400,"Avatar file is missing");
   }
 
   // upload  coverImage on cloudinary 
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   // check url in response recive from cloudinary
   if(!coverImage.url){
      throw new ApiError(400, "Error while uploading cover Image ")
   }

   //update coverImage url in DB 
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage: coverImage.url
         }
      },
      {new : true}
   ).select("-password")

   // response to user 
   return res.status(200).json(new ApiResponse(200,user , "updated coverImage succussfully"))
})


// Export functions
export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword ,getCurrentuser,updateAccountDetails , updateUserAvatar , updateUsearCoverImage};

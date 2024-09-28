import { ApiError } from "../utils/ApiError.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();

    // Check if token is not present
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by the decoded token's _id
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // Check if user exists
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach the user to the request object
    req.user = user;
    next();
    
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

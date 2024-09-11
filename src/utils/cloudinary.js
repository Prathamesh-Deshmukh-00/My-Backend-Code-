import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async function (localFilePath) {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!localFilePath) {
            console.error("No file path provided");
            return null;
        }

        // Upload the image
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log(response);
        console.log("Response URL is:", response.url);
        return response;

    } catch (error) {
        console.error("Error during upload:", error);
        return null; // returning null or handling it as needed

    } finally {
        try {
            // Remove the local file whether upload is successful or fails
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log("Temporary file removed");
            }
        } catch (cleanupError) {
            console.error("Error during file cleanup:", cleanupError);
        }
    }
};

export default uploadOnCloudinary;

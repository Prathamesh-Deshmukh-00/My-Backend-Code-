import mongoose, { Schema } from "mongoose";

const ImageSchema = new Schema(
  {
    image: {
      type: [String], // Array of URLs for the images
      required: true,
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Image = mongoose.model("Image", ImageSchema);
export default Image;

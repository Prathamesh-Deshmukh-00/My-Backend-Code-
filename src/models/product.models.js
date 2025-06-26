import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    Short_description: {
      type: String,
      required: true,
    },
    basic_info: {
      Usage: {
        type: String,
        required: true,
      },
      Color: {
        type: String,
        required: true,
      },
      Warranty: {
        type: String,
        required: true,
      },
      Battery_Voltage: {
        type: String,
        required: true,
      },
      Battery_capacity: {
        type: String,
        required: true,
      },
      Battery_Type: {
        type: String,
        required: true,
      },
      Product_Dimensions: {
        type: String,
        required: true,
      },
    },
    About_this_item: {
      Battery_Cell_Composition: {
        type: String,
        required: true,
      },
      Compatible_Phone_Models: {
        type: String,
        required: true,
      },
      Recommended_Uses: {
        type: String,
        required: true,
      },
      Net_Quantity: {
        type: String,
        required: true,
      },
      Reusability: {
        type: String,
        required: true,
      },
      Battery_Weight: {
        type: String,
        required: true,
      },
      Model_name: {
        type: String,
        required: true,
      },
    },
    more_details: {
      type: [String],
      required: true,
    },
    images_locations: {
      type: [String], // Array of URLs for the images
      required: true,
    },
    logo_details: [
      {
        logo_image: {
          type: String, // URL of the logo image
          required: false,
        },
        logo_description: {
          type: String, // Optional description for the logo
          required: false,
        },
      },
    ],
    product_category : {
      type: String, // Optional description for the logo
      required: false,
    },
    popular_product : {
      type: String, // Optional description for the logo
      required: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;

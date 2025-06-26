import Product from "../models/product.models.js";
import Image from "../models/image.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Create product 
const createProduct = asyncHandler(async (req, res) => {
  const { body } = req;

   console.log("this is body :- ",body);
  // Arrays to hold image URLs and logo details
  const images = [];
  const logoDetails = [];

  // Validate if required fields are present
  if (!body.name || !body.Short_description) {
    throw new ApiError(400, "Product name and short description are required");
  }

  console.log("check upcoming product images :- " ,req.files.images_locations); // Array of uploaded product images
console.log("check upcoming logo images  :- " ,req.files.logo_images); // Array of uploaded logo images
  // Upload images to Cloudinary
  if (req.files?.images_locations && Array.isArray(req.files.images_locations)) {
    for (const file of req.files.images_locations) {
      const result = await uploadOnCloudinary(file.path);
      if (result) {
        images.push(result.secure_url);
      } else {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
      }
    }
  } else if (req.files?.images_locations) {
    // In case a single file is sent instead of an array
    const result = await uploadOnCloudinary(req.files.images_locations.path);
    if (result) {
      images.push(result.secure_url);
    } else {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }
  }

  // Process logo images and descriptions
  if (req.files?.logo_images && Array.isArray(req.files.logo_images)) {
    if (!Array.isArray(body.logo_descriptions)) {
      throw new ApiError(400, "Logo descriptions must be provided as an array");
    }

    if (req.files.logo_images.length !== body.logo_descriptions.length) {
      throw new ApiError(
        400,
        "The number of logo images and descriptions must match"
      );
    }

    for (let i = 0; i < req.files.logo_images.length; i++) {
      const logo = req.files.logo_images[i];
      const description = body.logo_descriptions[i];

      const logoResult = await uploadOnCloudinary(logo.path);
      if (logoResult) {
        logoDetails.push({
          logo_image: logoResult.secure_url,
          logo_description: description,
        });
      } else {
        throw new ApiError(500, `Failed to upload logo at index ${i}`);
      }
    }
  } else if (req.files?.logo_images) {
    // In case a single logo image is sent instead of an array
    const logo = req.files.logo_images;
    const description = body.logo_descriptions;

    const logoResult = await uploadOnCloudinary(logo.path);
    if (logoResult) {
      logoDetails.push({
        logo_image: logoResult.secure_url,
        logo_description: description,
      });
    } else {
      throw new ApiError(500, "Failed to upload logo");
    }
  }

  // Create the product document
  const product = await Product.create({
    ...body,
    images_locations: images,
    logo_details: logoDetails,
  });

  res.status(201).json(new ApiResponse(201, "Product created successfully", product));
});

// Get products where product_category is provided in params
const getMostPopularProducts = asyncHandler(async (req, res) => {

  // Case-insensitive search to match database values
  const products = await Product.find({
    popular_product: "true",
  });

  if (!products.length) {
    throw new ApiError(404, `No products found in popular_product section`);
  }

  res.status(200).json(new ApiResponse(200, `popular_product retrieved successfully`, products));
});

// Get products where product_category is provided in params
const getProductsForDifferentCatagory = asyncHandler(async (req, res) => {
  const product_category = req.query.product_category; // Extract query parameter

  console.log("Product Category Received:", product_category); // Debugging

  if (!product_category) {
    throw new ApiError(400, "Product category is required"); // Handle missing category
  }

  // Case-insensitive search to match database values
  const products = await Product.find({
    product_category: { $regex: new RegExp(product_category, "i") },
  });

  if (!products.length) {
    throw new ApiError(404, `No products found in '${product_category}' section`);
  }

  res.status(200).json(new ApiResponse(200, `${product_category} retrieved successfully`, products));
});

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json(new ApiResponse(200, "Products retrieved successfully", products));
});

// Get a product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  res.status(200).json(new ApiResponse(200, "Product retrieved successfully", product));
});

// update produt
const updateProduct = asyncHandler(async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  // Arrays to hold image URLs
  const images = [];
  const logoDetails = [];

  // Validate if required fields are present
  if (!body.name || !body.Short_description) {
    throw new ApiError(400, "Product name and short description are required");
  }

  // Upload images to Cloudinary
  if (req.files?.images_locations) {
    for (const file of req.files.images_locations) {
      const result = await uploadOnCloudinary(file.path);
      if (result) {
        images.push(result.secure_url);
      } else {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
      }
    }
  }

  // Upload logos to Cloudinary and prepare `logo_details`
  if (req.files?.logo_images) {
    if (!body.logo_descriptions || !Array.isArray(body.logo_descriptions)) {
      throw new ApiError(400, "Logo descriptions are required and must be an array");
    }

    console.log("logo_descriptions length of logo is :- ", body.logo_descriptions.length);
    console.log("logo_descriptions  of logo is :- ", body.logo_descriptions);
    console.log("logo_images length of logo is :- ", req.files.logo_images.length);
    console.log("logo_images  of logo is :- ", req.files.logo_images);

    if (body.logo_descriptions.length !== req.files.logo_images.length) {
      throw new ApiError(
        400,
        "The number of logo descriptions must match the number of uploaded logos"
      );
    }

    for (let i = 0; i < req.files.logo_images.length; i++) {
      const file = req.files.logo_images[i];
      const description = body.logo_descriptions[i];

      const result = await uploadOnCloudinary(file.path);
      if (result) {
        logoDetails.push({ logo_image: result.secure_url, logo_description: description });
      } else {
        throw new ApiError(500, `Failed to upload logo image ${i + 1} to Cloudinary`);
      }
    }
  }

  // Prepare the update data
  const updateData = {
    ...body,
    images_locations: images.length ? images : undefined, // Update only if images are provided
    logo_details: logoDetails.length ? logoDetails : undefined, // Update only if logo details are provided
  };

  // Remove undefined fields from the update data
  for (const key in updateData) {
    if (updateData[key] === undefined) delete updateData[key];
  }

  console.log("Prepared updateData:", updateData);

  // Update the product document
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updateData }, // Use $set to ensure fields are updated selectively
    {
      new: true, // Return the updated document
      runValidators: true, // Apply schema validation rules
    }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(new ApiResponse(200, "Product updated successfully", product));
});

// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
});

const testApi = asyncHandler(async (req, res) => {
  try {
    if (!req.files?.Image || req.files.Image.length === 0) {
      throw new ApiError(400, "At least one image is required");
    }

    // Array to store the Cloudinary upload results
    const uploadedImages = [];

    // Loop through all the uploaded files
    for (const file of req.files.Image) {
      if (!file?.path) {
        throw new ApiError(400, "Invalid image file");
      }

      // Upload each image to Cloudinary
      const result = await uploadOnCloudinary(file.path);
      uploadedImages.push(result.secure_url);
    }

    // Save the uploaded image URLs to the database
    const products = await Image.create(
      uploadedImages.map((imageURL) => ({ image: imageURL }))
    );

    // Send response with the stored image data
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Images stored successfully",
          products
        )
      );
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Error uploading images",
          error.message
        )
      );
  }
});






export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  testApi,
  getMostPopularProducts,
  getProductsForDifferentCatagory
};

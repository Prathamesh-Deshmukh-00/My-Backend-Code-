import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  testApi,
  
  
} from "../controllers/product.controller.js";
// import {createCustomerDetails} from "../controllers/contact.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; // Ensure this points to your multer configuration file
import multer from "multer"; // Add this import

const router = express.Router();
// Route to create a product with file upload
router.post(
  "/",
  (req, res, next) => {
    // Upload middleware
    upload.fields([
      { name: "images_locations", maxCount: 10 }, // For product images
      { name: "logo_images", maxCount: 10 }, // For multiple logo images
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, error: "File upload failed." });
      }
      next();
    });
  },
  createProduct // Controller for product creation
);

// Other product routes
router.get("/:id", getProductById);

router.put(
  "/:id",
  (req, res, next) => {
    upload.fields([
      { name: "images_locations", maxCount: 5 }, // Allow up to 5 product images
      { name: "logo_images", maxCount: 10 }, // Allow up to 10 logo images
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, error: "File upload failed." });
      }
      next();
    });
  },
  updateProduct
);

router.delete("/:id", deleteProduct);
router.get("/", getAllProducts);


router.post(
  "/image",
  (req, res, next) => {
    upload.fields([{ name: "Image", maxCount: 10 }])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, error: "File upload failed." });
      }
      next();
    });
  },
  testApi
);


export default router;

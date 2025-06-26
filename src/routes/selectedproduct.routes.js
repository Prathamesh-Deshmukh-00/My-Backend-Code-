import express from "express";
import {
  getMostPopularProducts,
  getProductsForDifferentCatagory,
  
} from "../controllers/product.controller.js";
import {otpsecuritycheck,} from "../controllers/otpController.js";


const router = express.Router();

// get product by product category  
router.get("/", getProductsForDifferentCatagory);
router.get("/populer", getMostPopularProducts);

// delete unsecure otp 
router.delete("/:otp", otpsecuritycheck);




export default router;

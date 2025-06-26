import express from "express";
import { 
  createCustomerDetails, 
  getAllCustomers, 
  getCustomerById, 
  updateCustomerDetails, 
  deleteCustomer 
} from "../controllers/contact.controller.js";

const router = express.Router();

// Create a new customer
router.post("/", createCustomerDetails);

// Get all customers
router.get("/", getAllCustomers);

// Get a customer by ID
router.get("/:id", getCustomerById);

// Update a customer by ID
router.put("/", updateCustomerDetails);

// Delete a customer by ID
router.delete("/:id", deleteCustomer);

export default router;

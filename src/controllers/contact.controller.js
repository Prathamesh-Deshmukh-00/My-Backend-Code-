import Contact from "../models/contact.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";  // Assuming you have an ApiError utility for handling errors

// Create a new customer
const createCustomerDetails = asyncHandler(async (req, res) => {
  console.log("Received request body:", req.body);
  const { Number, Name, Massage, Service, Email } = req.body;
  const { body } = req;

  // Ensure phone number is required
  if (!Number) {
    throw new ApiError(400, "Phone number is required.");
  }

  // Validate phone number (should be 10 digits or in the format +91 followed by 10 digits)
  const phoneRegex = /^(?:\+91|0)?\d{10}$/;
  if (!phoneRegex.test(Number)) {
    throw new ApiError(400, "Invalid phone number. It must be a 10-digit number or start with +91 followed by 10 digits.");
  }

  // Validate email (only if provided)
  if (Email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Email)) {
    throw new ApiError(400, "Invalid email format.");
  }

  // Only validate Name, Massage, and Service if provided
  const contact = await Contact.create({
   ...body
  });

  console.log("Created contact:", contact);

  res.status(201).json(new ApiResponse(201, "Contact created successfully", contact));
});



// Get all customers
const getAllCustomers = asyncHandler(async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).json(new ApiResponse(200, "Customers retrieved successfully", contacts));
});

// Get a single customer by ID
const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contact = await Contact.findById(id);

  if (!contact) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(new ApiResponse(200, "Customer retrieved successfully", contact));
});

// Update customer details
const updateCustomerDetails = asyncHandler(async (req, res) => {
 
  const { id,Status } = req.body;

  
  const updatedContact = await Contact.findByIdAndUpdate(
    id,
    { Status },
    { new: true, runValidators: true }
  );

  if (!updatedContact) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(new ApiResponse(200, "Customer updated successfully", updatedContact));
});

// Delete customer
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedContact = await Contact.findByIdAndDelete(id);

  if (!deletedContact) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(new ApiResponse(200, "Customer deleted successfully"));
});

export { 
  createCustomerDetails, 
  getAllCustomers, 
  getCustomerById, 
  updateCustomerDetails, 
  deleteCustomer 
};

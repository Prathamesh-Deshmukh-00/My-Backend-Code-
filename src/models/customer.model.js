import mongoose, { Schema } from "mongoose";

const CustomerSchema = new Schema(
  {
    mobileNumber: {
      type: String, // Use String to accommodate different number formats
      required: true,
    },
  
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    strict: "throw",  // Prevents saving fields not defined in schema
  }
);

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;
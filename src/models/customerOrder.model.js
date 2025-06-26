import mongoose, { Schema } from "mongoose";

const CustomerOrderSchema = new Schema(
  {
    mobileNumber: {
      type: String, // Use String to accommodate different number formats
      required: true,
    },
    productName: {
      type: String, // Use String to store the name of the product
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    strict: "throw",  // Prevents saving fields not defined in schema
  }
);

const Order = mongoose.model("Order", CustomerOrderSchema);
export default Order;

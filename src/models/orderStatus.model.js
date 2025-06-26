import mongoose, { Schema } from "mongoose";

const CustomerOrderStatusSchema = new Schema(
  {
    Status: {
      type: String,
      required: true,
      enum: ["Completed", "Pending", "InProgress", "Close"], // Allowed values
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    strict: "throw",  // Prevents saving fields not defined in schema
  }
);

const OrderStatus = mongoose.model("OrderStatus", CustomerOrderStatusSchema);
export default OrderStatus;

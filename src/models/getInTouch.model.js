import mongoose, { Schema } from "mongoose";

const CustomerSchema = new Schema(
  {
    number: {
      type: String,  
      required: true,  
      unique: true,  // Ensures mobile numbers are unique
    },
  },
  {
    timestamps: true,  
    strict: "throw",  
  }
);

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;

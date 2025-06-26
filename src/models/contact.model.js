import mongoose, { Schema } from "mongoose";

const ContactUsSchema = new Schema(
  {
    Number: {
      type: Number,
      default: null,
      required : true
    },
    Name: {
      type: String,
      default: null,
      required: false,
    },
    Email: {
      type: String,
      default: null,
      required: false,
      unique: false,
    },
    Service: {
      type: String,
      default: null,
      required: false,
    },
    Massage: {
      type: String,
      default: null,
      required: false,
    },
    Status: {
        type: String,
        required: true,
        default: "Pending",
        enum: ["Completed", "Pending", "InProgress", "Close"], // Allowed values
      }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    strict: "throw",  // Prevents saving fields not defined in schema
  }
);

const Contact = mongoose.model("Contact", ContactUsSchema);
export default Contact;

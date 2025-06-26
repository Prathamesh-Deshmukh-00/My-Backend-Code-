import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan"; // For logging requests

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware configuration
app.use(
  cors({
    origin: "*", // Fallback to allow all origins if CORS_ORIGIN is not set
    // credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // JSON body parser with size limit
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // URL-encoded parser with size limit
app.use(express.static("public")); // Serve static files
app.use(cookieParser()); // Parse cookies

// Logging middleware for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Import routes
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import contactRouter from "./routes/contact.routes.js";
import selectedproducts from "./routes/selectedproduct.routes.js";
import otpRoutes from "./routes/otpRoutes.js";
import getInTouch from "./routes/getInTouch.route.js";

// Route declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/selectedproducts", selectedproducts);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/getintouch", getInTouch);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error for debugging
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

export { app };

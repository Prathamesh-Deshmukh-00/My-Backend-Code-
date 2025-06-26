import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables
dotenv.config({ path: "./env" });

// Ensure required environment variables are set
const PORT = process.env.PORT || 8001;
const DB_CONNECTION_STRING = process.env.MONGODB_URL;

if (!DB_CONNECTION_STRING) {
  console.error("Error: DB_CONNECTION_STRING is not defined in the environment variables.");
  process.exit(1); // Exit the process if DB connection string is missing
}

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed!", error);
    process.exit(1); // Exit the process on DB connection failure
  });

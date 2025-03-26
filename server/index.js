import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import indexRoutes from "./src/setup/routes.setup.js";
import errorHandler from "./src/middleware/errorHandler.js";
import { configurePassport } from "./src/config/passport.js";
import { initializeServices } from "./src/setup/rabbitmq.setup.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Configure Passport
configurePassport();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(passport.initialize());

// Routes
app.use("/auth-system/v0/", indexRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
initializeServices()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize services:", error);
  });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Configure CORS to allow requests from your frontend's origin
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-production-frontend-domain.com"
        : "http://localhost:8000",
    credentials: true,
  })
);

// Import routes
import clientRoutes from "./routes/clientRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminReceiptRoutes from "./routes/adminReceiptRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import adminBillRoutes from "./routes/adminBillRoutes.js";

// Use routes
app.use("/api/clients", clientRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin-receipts", adminReceiptRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/admin-bills", adminBillRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

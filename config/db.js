const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use the provided MongoDB Atlas URI
    const mongoURI =
      "mongodb+srv://mukilan:mukilan@cluster0.c5yb5jt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up event listeners for connection issues
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.info("MongoDB reconnected successfully");
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't exit the process on error to allow for reconnection attempts
    console.error("Will retry connection automatically");
  }
};

module.exports = connectDB;

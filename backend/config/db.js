
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string - will be replaced with your Atlas URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/goldsmith';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,   // 45 seconds
      maxPoolSize: 50,          // Maintain up to 50 socket connections
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up event listeners for connection issues
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

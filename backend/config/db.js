
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string with your Atlas URI
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Vignesh:vignesh@cluster0.6fjqe2e.mongodb.net/goldsmith?retryWrites=true&w=majority&appName=Cluster0';
    
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

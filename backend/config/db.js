
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string - will be replaced with your Atlas URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/goldsmith';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Configure CORS to allow requests from any origin during development
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true
}));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/admin-receipts', require('./routes/adminReceiptRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/admin-bills', require('./routes/adminBillRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Any route not covered will return the frontend
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT =5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

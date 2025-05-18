
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getSalesByDateRange,
  getMetalTypeDistribution,
  getYearlyComparison
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// For development, make routes accessible without authentication
const isProduction = process.env.NODE_ENV === 'production';
const routeHandler = isProduction ? protect : (req, res, next) => next();

// Analytics routes
router.route('/dashboard').get(routeHandler, getDashboardStats);
router.route('/sales').get(routeHandler, getSalesByDateRange);
router.route('/metal-types').get(routeHandler, getMetalTypeDistribution);
router.route('/yearly-comparison').get(routeHandler, getYearlyComparison);

module.exports = router;

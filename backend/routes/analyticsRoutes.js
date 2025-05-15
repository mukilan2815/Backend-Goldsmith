
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getSalesByDateRange,
  getMetalTypeDistribution,
  getYearlyComparison
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All analytics routes are protected
router.route('/dashboard').get(protect, getDashboardStats);
router.route('/sales').get(protect, getSalesByDateRange);
router.route('/metal-types').get(protect, getMetalTypeDistribution);
router.route('/yearly-comparison').get(protect, getYearlyComparison);

module.exports = router;

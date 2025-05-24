
const Receipt = require('../models/receiptModel');
const Client = require('../models/clientModel');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalClients = await Client.countDocuments();
  const totalReceipts = await Receipt.countDocuments();
  const adminReceipts = await Receipt.countDocuments({ metalType: 'Gold' });
  
  // Total weight processed
  const weightStats = await Receipt.aggregate([
    {
      $group: {
        _id: null,
        totalGrossWeight: { $sum: '$totals.grossWt' },
      },
    },
  ]);
  
  // Get recently added items
  const recentActivity = await Receipt.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('clientId', 'clientName shopName');
  
  // Calculate percentage change in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  // Clients change
  const newClientsLastMonth = await Client.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  
  const newClientsPreviousMonth = await Client.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  
  const clientsChange = newClientsPreviousMonth === 0
    ? 100
    : Math.round(((newClientsLastMonth - newClientsPreviousMonth) / newClientsPreviousMonth) * 100);
  
  // Receipts change
  const newReceiptsLastMonth = await Receipt.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  
  const newReceiptsPreviousMonth = await Receipt.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  
  const receiptsChange = newReceiptsPreviousMonth === 0
    ? 100
    : Math.round(((newReceiptsLastMonth - newReceiptsPreviousMonth) / newReceiptsPreviousMonth) * 100);
  
  // Admin receipts change
  const newAdminReceiptsLastMonth = await Receipt.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
    metalType: 'Gold',
  });
  
  const newAdminReceiptsPreviousMonth = await Receipt.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    metalType: 'Gold',
  });
  
  const adminReceiptsChange = newAdminReceiptsPreviousMonth === 0
    ? 100
    : Math.round(((newAdminReceiptsLastMonth - newAdminReceiptsPreviousMonth) / newAdminReceiptsPreviousMonth) * 100);
  
  // Weight change
  const weightLastMonth = await Receipt.aggregate([
    {
      $match: { createdAt: { $gte: thirtyDaysAgo } },
    },
    {
      $group: { _id: null, total: { $sum: '$totals.grossWt' } },
    },
  ]);
  
  const weightPreviousMonth = await Receipt.aggregate([
    {
      $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } },
    },
    {
      $group: { _id: null, total: { $sum: '$totals.grossWt' } },
    },
  ]);
  
  const lastMonthWeight = weightLastMonth[0]?.total || 0;
  const prevMonthWeight = weightPreviousMonth[0]?.total || 0;
  
  const weightChange = prevMonthWeight === 0
    ? 100
    : Math.round(((lastMonthWeight - prevMonthWeight) / prevMonthWeight) * 100);
  
  res.json({
    stats: {
      totalClients: {
        value: totalClients,
        trend: { value: clientsChange, isPositive: clientsChange >= 0 },
      },
      totalReceipts: {
        value: totalReceipts,
        trend: { value: receiptsChange, isPositive: receiptsChange >= 0 },
      },
      adminReceipts: {
        value: adminReceipts,
        trend: { value: adminReceiptsChange, isPositive: adminReceiptsChange >= 0 },
      },
      totalWeight: {
        value: `${Math.round(weightStats[0]?.totalGrossWeight || 0)} g`,
        trend: { value: weightChange, isPositive: weightChange >= 0 },
      },
    },
    recentActivity,
  });
});

// @desc    Get sales by date range
// @route   GET /api/analytics/sales
// @access  Private
const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Start date and end date are required');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end day
  
  // Group by day
  const dailyData = await Receipt.aggregate([
    {
      $match: {
        issueDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' },
          day: { $dayOfMonth: '$issueDate' },
        },
        count: { $sum: 1 },
        totalWeight: { $sum: '$totals.grossWt' },
        totalFinalWeight: { $sum: '$totals.finalWt' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        },
        count: 1,
        totalWeight: 1,
        totalFinalWeight: 1,
      },
    },
  ]);
  
  res.json(dailyData);
});

// @desc    Get metal type distribution
// @route   GET /api/analytics/metal-types
// @access  Private
const getMetalTypeDistribution = asyncHandler(async (req, res) => {
  const distribution = await Receipt.aggregate([
    {
      $group: {
        _id: '$metalType',
        count: { $sum: 1 },
        totalWeight: { $sum: '$totals.grossWt' },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        count: 1,
        totalWeight: 1,
      },
    },
  ]);
  
  res.json(distribution);
});

// @desc    Get yearly comparison data
// @route   GET /api/analytics/yearly-comparison
// @access  Private
const getYearlyComparison = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  
  // Get monthly data for current year
  const currentYearData = await Receipt.aggregate([
    {
      $match: {
        issueDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$issueDate' } },
        count: { $sum: 1 },
        totalWeight: { $sum: '$totals.grossWt' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        count: 1,
        totalWeight: 1,
        year: currentYear,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  
  // Get monthly data for previous year
  const previousYearData = await Receipt.aggregate([
    {
      $match: {
        issueDate: {
          $gte: new Date(`${previousYear}-01-01`),
          $lte: new Date(`${previousYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$issueDate' } },
        count: { $sum: 1 },
        totalWeight: { $sum: '$totals.grossWt' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        count: 1,
        totalWeight: 1,
        year: previousYear,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  
  res.json({
    currentYear: currentYearData,
    previousYear: previousYearData,
  });
});

module.exports = {
  getDashboardStats,
  getSalesByDateRange,
  getMetalTypeDistribution,
  getYearlyComparison,
};

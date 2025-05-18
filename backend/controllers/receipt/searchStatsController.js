
const Receipt = require('../../models/receiptModel');
const asyncHandler = require('express-async-handler');
const { generateVoucherId } = require('../../utils/receiptUtils');

// @desc    Generate a new unique voucher ID
// @route   GET /api/receipts/generate-voucher-id
// @access  Public
const getVoucherId = asyncHandler(async (req, res) => {
  const voucherId = await generateVoucherId();
  res.json({ voucherId });
});

// @desc    Search receipts
// @route   GET /api/receipts/search
// @access  Public
const searchReceipts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    res.status(400);
    throw new Error('Search query must be at least 2 characters');
  }
  
  // Search by voucher ID, client name, shop name, etc.
  const receipts = await Receipt.find({
    $or: [
      { voucherId: { $regex: query, $options: 'i' } },
      { 'clientInfo.clientName': { $regex: query, $options: 'i' } },
      { 'clientInfo.shopName': { $regex: query, $options: 'i' } },
    ],
  }).limit(20);
  
  res.json(receipts);
});

// @desc    Get receipt stats
// @route   GET /api/receipts/stats
// @access  Private
const getReceiptStats = asyncHandler(async (req, res) => {
  // Total receipts
  const totalReceipts = await Receipt.countDocuments();
  
  // Receipts by metal type
  const metalTypeCounts = await Receipt.aggregate([
    { $group: { _id: '$metalType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Total weight processed
  const weightStats = await Receipt.aggregate([
    {
      $group: {
        _id: null,
        totalGrossWeight: { $sum: '$totals.grossWt' },
        totalNetWeight: { $sum: '$totals.netWt' },
        totalFinalWeight: { $sum: '$totals.finalWt' },
      },
    },
  ]);
  
  // Receipts by month (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const monthlyStats = await Receipt.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        totalWeight: { $sum: '$totals.grossWt' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  
  res.json({
    totalReceipts,
    metalTypeCounts,
    weightStats: weightStats[0] || {
      totalGrossWeight: 0,
      totalNetWeight: 0,
      totalFinalWeight: 0,
    },
    monthlyStats,
  });
});

module.exports = {
  getVoucherId,
  searchReceipts,
  getReceiptStats
};

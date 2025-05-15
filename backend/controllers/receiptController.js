
const Receipt = require('../models/receiptModel');
const Client = require('../models/clientModel');
const asyncHandler = require('express-async-handler');

// Helper to generate a unique voucher ID
const generateVoucherId = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `GS-${year}${month}`;
  
  // Find the latest receipt with this prefix
  const latestReceipt = await Receipt.findOne({ 
    voucherId: { $regex: `^${prefix}` } 
  }).sort({ voucherId: -1 });
  
  let nextNumber = 1;
  if (latestReceipt) {
    // Extract the number from the latest receipt ID
    const latestNumber = parseInt(latestReceipt.voucherId.split('-')[2]);
    if (!isNaN(latestNumber)) {
      nextNumber = latestNumber + 1;
    }
  }
  
  // Format the number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}-${formattedNumber}`;
};

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Public
const getReceipts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || -1;
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;
  
  // Filtering options
  const filter = {};
  if (req.query.metalType) {
    filter.metalType = req.query.metalType;
  }
  if (req.query.isCompleted) {
    filter.isCompleted = req.query.isCompleted === 'true';
  }
  if (req.query.startDate && req.query.endDate) {
    filter.issueDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }
  
  const count = await Receipt.countDocuments(filter);
  const receipts = await Receipt.find(filter)
    .sort(sortOptions)
    .limit(pageSize)
    .skip(pageSize * (page - 1));
    
  res.json({
    receipts,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
// @access  Public
const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  
  if (receipt) {
    res.json(receipt);
  } else {
    res.status(404);
    throw new Error('Receipt not found');
  }
});

// @desc    Get receipts by client ID
// @route   GET /api/receipts/client/:clientId
// @access  Public
const getReceiptsByClientId = asyncHandler(async (req, res) => {
  const { clientId } = req.params;
  
  // Verify client exists
  const client = await Client.findById(clientId);
  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }
  
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  
  const count = await Receipt.countDocuments({ clientId });
  
  const receipts = await Receipt.find({ clientId })
    .sort({ issueDate: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
    
  res.json({
    receipts,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Public
const createReceipt = asyncHandler(async (req, res) => {
  const { clientId, clientInfo, metalType, issueDate, items, totals, notes, deliveryDate } = req.body;

  // Validate client exists
  const client = await Client.findById(clientId);
  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  // Generate unique voucher ID
  const voucherId = await generateVoucherId();

  // Calculate totals if not provided
  let calculatedTotals = totals;
  if (!calculatedTotals) {
    calculatedTotals = {
      grossWt: 0,
      stoneWt: 0,
      netWt: 0,
      finalWt: 0,
      stoneAmt: 0,
    };
    
    items.forEach(item => {
      calculatedTotals.grossWt += Number(item.grossWt);
      calculatedTotals.stoneWt += Number(item.stoneWt);
      calculatedTotals.stoneAmt += Number(item.stoneAmt);
    });
    
    calculatedTotals.netWt = calculatedTotals.grossWt - calculatedTotals.stoneWt;
    calculatedTotals.finalWt = calculatedTotals.netWt * (item.meltingTouch / 100);
  }

  const receipt = await Receipt.create({
    clientId,
    clientInfo: clientInfo || {
      clientName: client.clientName,
      shopName: client.shopName,
      phoneNumber: client.phoneNumber,
    },
    metalType,
    issueDate: issueDate || new Date(),
    items,
    totals: calculatedTotals,
    voucherId,
    notes,
    deliveryDate,
  });

  if (receipt) {
    res.status(201).json(receipt);
  } else {
    res.status(400);
    throw new Error('Invalid receipt data');
  }
});

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Public
const updateReceipt = asyncHandler(async (req, res) => {
  const { metalType, issueDate, items, totals, notes, deliveryDate, isCompleted } = req.body;

  const receipt = await Receipt.findById(req.params.id);

  if (receipt) {
    // Calculate totals if items were updated
    let updatedTotals = totals;
    if (items && !totals) {
      updatedTotals = {
        grossWt: 0,
        stoneWt: 0,
        netWt: 0,
        finalWt: 0,
        stoneAmt: 0,
      };
      
      items.forEach(item => {
        updatedTotals.grossWt += Number(item.grossWt);
        updatedTotals.stoneWt += Number(item.stoneWt);
        updatedTotals.stoneAmt += Number(item.stoneAmt);
      });
      
      updatedTotals.netWt = updatedTotals.grossWt - updatedTotals.stoneWt;
      // Use first item's melting touch as reference if available
      const meltingTouch = items[0]?.meltingTouch || receipt.items[0]?.meltingTouch || 100;
      updatedTotals.finalWt = updatedTotals.netWt * (meltingTouch / 100);
    }

    receipt.metalType = metalType || receipt.metalType;
    receipt.issueDate = issueDate || receipt.issueDate;
    receipt.items = items || receipt.items;
    receipt.totals = updatedTotals || receipt.totals;
    receipt.notes = notes !== undefined ? notes : receipt.notes;
    receipt.deliveryDate = deliveryDate !== undefined ? deliveryDate : receipt.deliveryDate;
    receipt.isCompleted = isCompleted !== undefined ? isCompleted : receipt.isCompleted;

    const updatedReceipt = await receipt.save();
    res.json(updatedReceipt);
  } else {
    res.status(404);
    throw new Error('Receipt not found');
  }
});

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Public
const deleteReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);

  if (receipt) {
    await receipt.deleteOne();
    res.json({ message: 'Receipt removed' });
  } else {
    res.status(404);
    throw new Error('Receipt not found');
  }
});

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
  getReceipts,
  getReceiptById,
  getReceiptsByClientId,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getVoucherId,
  searchReceipts,
  getReceiptStats,
};

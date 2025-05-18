
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
  console.log("Received receipt data:", JSON.stringify(req.body));
  
  const { 
    clientId, 
    clientName, 
    clientInfo,
    shopName, 
    phoneNumber, 
    metalType, 
    overallWeight,
    issueDate, 
    tableData, 
    items,
    totals, 
    notes, 
    deliveryDate,
    voucherId,
    payments,
    totalPaidAmount,
    balanceDue,
    paymentStatus
  } = req.body;

  // Validate client exists if ID is provided
  let client;
  if (clientId) {
    try {
      client = await Client.findById(clientId);
      if (!client && clientId !== 'temp-id' && !clientId.includes('temp-')) {
        res.status(404);
        throw new Error('Client not found');
      }
    } catch (error) {
      console.log('Client validation error:', error.message);
      // If it's not a "Client not found" error but a database error
      if (error.message !== 'Client not found') {
        console.error('Database error during client lookup:', error);
        res.status(500);
        throw new Error('Database error during client validation');
      }
      throw error; // Re-throw the "Client not found" error
    }
  }

  // Generate unique voucher ID if not provided
  let finalVoucherId = voucherId;
  if (!finalVoucherId) {
    finalVoucherId = await generateVoucherId();
  }

  try {
    // Handle both formats - tableData array or items array
    let receiptItems;
    if (tableData && Array.isArray(tableData)) {
      // Map items from tableData format to the expected model format
      receiptItems = tableData.map(item => ({
        itemName: item.itemName,
        tag: item.tag || "",
        grossWt: parseFloat(item.grossWt) || 0,
        stoneWt: parseFloat(item.stoneWt) || 0,
        meltingTouch: parseFloat(item.meltingTouch) || 0,
        stoneAmt: parseFloat(item.stoneAmt) || 0,
        totalInvoiceAmount: parseFloat(item.totalInvoiceAmount) || 0,
      }));
    } else if (items && Array.isArray(items)) {
      // Map items from the frontend format to the expected model format
      receiptItems = items.map(item => ({
        itemName: item.description || item.itemName,
        tag: item.tag || "",
        grossWt: parseFloat(item.grossWeight || item.grossWt) || 0,
        stoneWt: parseFloat(item.stoneWeight || item.stoneWt) || 0,
        meltingTouch: parseFloat(item.meltingPercent || item.meltingTouch) || 0,
        stoneAmt: parseFloat(item.stoneAmount || item.stoneAmt) || 0,
        totalInvoiceAmount: parseFloat(item.amount || item.totalInvoiceAmount) || 0,
      }));
    } else {
      receiptItems = [];
    }

    // Prepare client info from either format
    const clientInfoData = clientInfo || {
      clientName: clientName || (client?.clientName || ""),
      shopName: shopName || (client?.shopName || ""),
      phoneNumber: phoneNumber || (client?.phoneNumber || ""),
    };

    // Calculate total invoice amount if not provided
    let totalInvoiceAmount = 0;
    if (totals && totals.totalInvoiceAmount) {
      totalInvoiceAmount = parseFloat(totals.totalInvoiceAmount);
    } else {
      // Calculate from items
      totalInvoiceAmount = receiptItems.reduce((sum, item) => sum + (parseFloat(item.totalInvoiceAmount) || 0), 0);
    }

    // Initialize payment tracking if not provided
    const paymentsData = payments || [];
    const totalPaidAmountValue = parseFloat(totalPaidAmount) || 0;
    const balanceDueValue = parseFloat(balanceDue) || totalInvoiceAmount - totalPaidAmountValue;
    
    let paymentStatusValue = paymentStatus || 'Pending';
    if (!paymentStatus) {
      if (totalInvoiceAmount <= 0) {
        paymentStatusValue = 'Paid';
      } else if (balanceDueValue <= 0) {
        paymentStatusValue = 'Paid';
      } else if (totalPaidAmountValue > 0 && balanceDueValue > 0) {
        paymentStatusValue = 'Partially Paid';
      } else {
        paymentStatusValue = 'Pending';
      }
    }

    const receiptData = {
      clientId,
      clientInfo: clientInfoData,
      metalType,
      overallWeight: parseFloat(overallWeight) || 0,
      issueDate: issueDate || new Date(),
      items: receiptItems,
      voucherId: finalVoucherId,
      notes,
      deliveryDate,
      // Include payment tracking fields
      payments: paymentsData,
      totalPaidAmount: totalPaidAmountValue,
      balanceDue: balanceDueValue,
      paymentStatus: paymentStatusValue,
      // If totals are provided, use them, otherwise they'll be calculated by the model
      ...(totals && {
        totals: {
          grossWt: parseFloat(totals.grossWt) || 0,
          stoneWt: parseFloat(totals.stoneWt) || 0,
          netWt: parseFloat(totals.netWt) || 0,
          finalWt: parseFloat(totals.finalWt) || 0,
          stoneAmt: parseFloat(totals.stoneAmt) || 0,
          totalInvoiceAmount: totalInvoiceAmount
        }
      })
    };

    console.log("Creating receipt with data:", JSON.stringify(receiptData));
    const receipt = await Receipt.create(receiptData);

    if (receipt) {
      res.status(201).json(receipt);
    } else {
      res.status(400);
      throw new Error('Invalid receipt data');
    }
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(400);
    throw new Error(`Failed to create receipt: ${error.message}`);
  }
});

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Public
const updateReceipt = asyncHandler(async (req, res) => {
  const { 
    metalType, 
    issueDate, 
    items, 
    totals, 
    notes, 
    deliveryDate, 
    isCompleted,
    payments,
    totalPaidAmount,
    balanceDue,
    paymentStatus
  } = req.body;

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
        totalInvoiceAmount: 0
      };
      
      items.forEach(item => {
        updatedTotals.grossWt += Number(item.grossWt);
        updatedTotals.stoneWt += Number(item.stoneWt);
        updatedTotals.stoneAmt += Number(item.stoneAmt);
        updatedTotals.totalInvoiceAmount += Number(item.totalInvoiceAmount || 0);
      });
      
      updatedTotals.netWt = updatedTotals.grossWt - updatedTotals.stoneWt;
      // Use first item's melting touch as reference if available
      const meltingTouch = items[0]?.meltingTouch || receipt.items[0]?.meltingTouch || 100;
      updatedTotals.finalWt = updatedTotals.netWt * (meltingTouch / 100);
    }

    // Calculate payment totals if payments were updated
    let updatedPayments = payments || receipt.payments;
    let updatedTotalPaid = totalPaidAmount;
    
    if (payments && !totalPaidAmount) {
      updatedTotalPaid = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);
    }
    
    // Calculate balance due if needed
    let updatedBalanceDue = balanceDue;
    if ((updatedTotals || totals || items) && (payments || totalPaidAmount)) {
      const invoiceAmount = (updatedTotals?.totalInvoiceAmount || totals?.totalInvoiceAmount ||
        receipt.totals.totalInvoiceAmount);
      updatedBalanceDue = invoiceAmount - (updatedTotalPaid || receipt.totalPaidAmount);
    }
    
    // Determine payment status if not provided
    let updatedPaymentStatus = paymentStatus;
    if (!paymentStatus && (updatedBalanceDue !== undefined || updatedTotalPaid !== undefined)) {
      const invoiceAmount = (updatedTotals?.totalInvoiceAmount || totals?.totalInvoiceAmount ||
        receipt.totals.totalInvoiceAmount);
      const finalBalanceDue = updatedBalanceDue !== undefined ? updatedBalanceDue : receipt.balanceDue;
      const finalTotalPaid = updatedTotalPaid !== undefined ? updatedTotalPaid : receipt.totalPaidAmount;
      
      if (invoiceAmount <= 0) {
        updatedPaymentStatus = 'Paid';
      } else if (finalBalanceDue <= 0) {
        updatedPaymentStatus = 'Paid';
      } else if (finalTotalPaid > 0 && finalBalanceDue > 0) {
        updatedPaymentStatus = 'Partially Paid';
      } else {
        updatedPaymentStatus = 'Pending';
      }
    }

    receipt.metalType = metalType || receipt.metalType;
    receipt.issueDate = issueDate || receipt.issueDate;
    receipt.items = items || receipt.items;
    receipt.totals = updatedTotals || receipt.totals;
    receipt.notes = notes !== undefined ? notes : receipt.notes;
    receipt.deliveryDate = deliveryDate !== undefined ? deliveryDate : receipt.deliveryDate;
    receipt.isCompleted = isCompleted !== undefined ? isCompleted : receipt.isCompleted;
    
    // Update payment tracking fields
    receipt.payments = updatedPayments;
    if (updatedTotalPaid !== undefined) receipt.totalPaidAmount = updatedTotalPaid;
    if (updatedBalanceDue !== undefined) receipt.balanceDue = updatedBalanceDue;
    if (updatedPaymentStatus !== undefined) receipt.paymentStatus = updatedPaymentStatus;

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

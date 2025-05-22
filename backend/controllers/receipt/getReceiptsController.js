const Receipt = require("../../models/receiptModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Public
const getReceipts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder || -1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  // Filtering options
  const filter = {};
  if (req.query.metalType) {
    filter.metalType = req.query.metalType;
  }
  if (req.query.isCompleted) {
    filter.isCompleted = req.query.isCompleted === "true";
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
    total: count,
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
    throw new Error("Receipt not found");
  }
});

// @desc    Get receipts by client ID
// @route   GET /api/receipts/client/:clientId
// @access  Public
const getReceiptsByClientId = asyncHandler(async (req, res) => {
  const { clientId } = req.params;
  const Client = require("../../models/clientModel");

  // Verify client exists
  const client = await Client.findById(clientId);
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
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
    total: count,
  });
});

module.exports = {
  getReceipts,
  getReceiptById,
  getReceiptsByClientId,
};

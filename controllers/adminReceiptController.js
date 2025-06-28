const AdminReceipt = require("../models/adminReceiptModel");
const Client = require("../models/clientModel");
const asyncHandler = require("express-async-handler");

// Helper to generate a unique voucher ID for admin receipts
const generateVoucherId = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `WK-`;

  // Find the latest receipt with this prefix
  const latestReceipt = await AdminReceipt.findOne({
    voucherId: { $regex: `^${prefix}` },
  }).sort({ voucherId: -1 });

  let nextNumber = 1;
  if (latestReceipt) {
    // Extract the number from the latest receipt ID
    const parts = latestReceipt.voucherId.split("-");
    const latestNumber = parseInt(parts[2], 10);
    if (!isNaN(latestNumber)) {
      nextNumber = latestNumber + 1;
    }
  }

  // Format the number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(4, "0");
  return `${prefix}-${formattedNumber}`;
};

// @desc    Get all admin receipts
// @route   GET /api/admin-receipts
// @access  Public
const getAdminReceipts = asyncHandler(async (req, res) => {
  // Check if request includes a clientId query parameter
  const clientId = req.query.clientId;

  let query = {};
  if (clientId) {
    query.clientId = clientId;
  }

  const adminReceipts = await AdminReceipt.find(query).sort({ createdAt: -1 });
  res.json(adminReceipts);
});

// @desc    Get admin receipt by ID
// @route   GET /api/admin-receipts/:id
// @access  Public
const getAdminReceiptById = asyncHandler(async (req, res) => {
  const adminReceipt = await AdminReceipt.findById(req.params.id);

  if (adminReceipt) {
    res.json(adminReceipt);
  } else {
    res.status(404);
    throw new Error("Admin receipt not found");
  }
});

// @desc    Create new admin receipt
// @route   POST /api/admin-receipts
// @access  Public
const createAdminReceipt = asyncHandler(async (req, res) => {
  const { clientId, clientName, given, received, status, manualCalculations } =
    req.body;

  // Validate client exists
  const client = await Client.findById(clientId);
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  // Generate unique voucher ID
  const voucherId = await generateVoucherId();

  const adminReceipt = await AdminReceipt.create({
    clientId,
    clientName,
    given,
    received,
    status: status || "incomplete",
    voucherId,
    manualCalculations: manualCalculations || {
      givenTotal: 0,
      receivedTotal: 0,
      operation: "subtract-given-received",
      result: 0,
    },
  });

  if (adminReceipt) {
    res.status(201).json(adminReceipt);
  } else {
    res.status(400);
    throw new Error("Invalid admin receipt data");
  }
});

// @desc    Update admin receipt
// @route   PUT /api/admin-receipts/:id
// @access  Public
const updateAdminReceipt = asyncHandler(async (req, res) => {
  const { given, received, status, manualCalculations } = req.body; // Add manualCalculations

  const adminReceipt = await AdminReceipt.findById(req.params.id);

  if (adminReceipt) {
    adminReceipt.given = given || adminReceipt.given;
    adminReceipt.received = received || adminReceipt.received;
    adminReceipt.status = status || adminReceipt.status;
    adminReceipt.manualCalculations =
      manualCalculations || adminReceipt.manualCalculations;

    const updatedAdminReceipt = await adminReceipt.save();
    res.json(updatedAdminReceipt);
  } else {
    res.status(404);
    throw new Error("Admin receipt not found");
  }
});

// @desc    Delete admin receipt
// @route   DELETE /api/admin-receipts/:id
// @access  Public
const deleteAdminReceipt = asyncHandler(async (req, res) => {
  const adminReceipt = await AdminReceipt.findById(req.params.id);

  if (adminReceipt) {
    await adminReceipt.deleteOne();
    res.json({ message: "Admin receipt removed" });
  } else {
    res.status(404);
    throw new Error("Admin receipt not found");
  }
});

// @desc    Search admin receipts
// @route   GET /api/admin-receipts/search
// @access  Public
const searchAdminReceipts = asyncHandler(async (req, res) => {
  const { query, dateFrom, dateTo, status } = req.query;

  let searchQuery = {};

  // Text search if query is provided
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Date range search
  if (dateFrom || dateTo) {
    searchQuery.$or = [];

    const dateFilter = {};
    if (dateFrom) {
      dateFilter.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.$lte = new Date(dateTo);
    }

    if (Object.keys(dateFilter).length > 0) {
      searchQuery.$or.push({ "given.date": dateFilter });
      searchQuery.$or.push({ "received.date": dateFilter });
    }
  }

  // Status filter
  if (status) {
    searchQuery.status = status;
  }

  // If no $or conditions were added, remove the $or property
  if (searchQuery.$or && searchQuery.$or.length === 0) {
    delete searchQuery.$or;
  }

  const adminReceipts = await AdminReceipt.find(searchQuery).sort({
    createdAt: -1,
  });
  res.json(adminReceipts);
});

// @desc    Generate a new unique voucher ID for admin receipts
// @route   GET /api/admin-receipts/generate-voucher-id
// @access  Public
const getVoucherId = asyncHandler(async (req, res) => {
  const voucherId = await generateVoucherId();
  res.json({ voucherId });
});

module.exports = {
  getAdminReceipts,
  getAdminReceiptById,
  createAdminReceipt,
  updateAdminReceipt,
  deleteAdminReceipt,
  searchAdminReceipts,
  getVoucherId,
};

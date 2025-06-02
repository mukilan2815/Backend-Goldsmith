const mongoose = require("mongoose");
const Receipt = require("../models/receiptModel");

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const receipts = await Receipt.find()
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Receipt.countDocuments();

    res.status(200).json({
      success: true,
      data: receipts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Private
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).lean();

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid receipt ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get receipts by client ID
// @route   GET /api/receipts/client/:clientId
// @access  Private
const getReceiptsByClientId = async (req, res) => {
  try {
    const receipts = await Receipt.find({ clientId: req.params.clientId })
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
  try {
    // Map tableData to items if present
    if (req.body.tableData && !req.body.items) {
      req.body.items = req.body.tableData.map((item) => ({
        itemName: item.itemName,
        description: item.description,
        tag: item.tag,
        grossWt: item.grossWt,
        stoneWt: item.stoneWt,
        meltingTouch: item.meltingPercent || item.meltingTouch || 0, // Handle both field names
        netWt: item.netWt,
        finalWt: item.finalWt,
        stoneAmt: item.stoneAmt,
        totalInvoiceAmount: item.totalInvoiceAmount || 0,
      }));
    }

    // Calculate totals if not provided
    if (!req.body.totals && req.body.items) {
      req.body.totals = calculateTotals(req.body.items);
    }

    const receipt = await Receipt.create(req.body);

    res.status(201).json({
      success: true,
      data: receipt,
      message: "Receipt created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to calculate receipt totals
const calculateTotals = (items) => {
  return items.reduce(
    (totals, item) => {
      totals.grossWt += item.grossWt || 0;
      totals.stoneWt += item.stoneWt || 0;
      totals.netWt += item.netWt || 0;
      totals.finalWt += item.finalWt || 0;
      totals.stoneAmt += item.stoneAmt || 0;
      totals.meltingTouch = item.meltingTouch || 0; // Changed from meltingPercent to meltingTouch
      totals.totalInvoiceAmount += item.totalInvoiceAmount || 0;
      return totals;
    },
    {
      grossWt: 0,
      stoneWt: 0,
      netWt: 0,
      finalWt: 0,
      stoneAmt: 0,
      meltingTouch: 0, // Changed from meltingPercent to meltingTouch
      totalInvoiceAmount: 0,
    }
  );
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
  try {
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedReceipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedReceipt,
      message: "Receipt updated successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Generate voucher ID
// @route   GET /api/receipts/generate-voucher-id
// @access  Private
const getVoucherId = async (req, res) => {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);

    // Find the latest voucher for this month/year
    const latestVoucher = await Receipt.findOne({
      voucherId: new RegExp(`^CL-${month}${year}-`),
    }).sort("-voucherId");

    let nextNumber = 1;
    if (latestVoucher) {
      const lastNumber = parseInt(latestVoucher.voucherId.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    const voucherId = `CL-${month}${year}-${nextNumber
      .toString()
      .padStart(4, "0")}`;

    res.status(200).json({
      success: true,
      data: { voucherId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Search receipts
// @route   GET /api/receipts/search
// @access  Private
const searchReceipts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    const searchResults = await Receipt.find({
      $or: [
        { voucherId: { $regex: query, $options: "i" } },
        { "clientInfo.clientName": { $regex: query, $options: "i" } },
        { "clientInfo.shopName": { $regex: query, $options: "i" } },
      ],
    })
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Receipt.countDocuments({
      $or: [
        { voucherId: { $regex: query, $options: "i" } },
        { "clientInfo.clientName": { $regex: query, $options: "i" } },
        { "clientInfo.shopName": { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      data: searchResults,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get receipt statistics
// @route   GET /api/receipts/stats
// @access  Private
const getReceiptStats = async (req, res) => {
  try {
    const stats = await Receipt.aggregate([
      {
        $group: {
          _id: null,
          totalReceipts: { $sum: 1 },
          totalGold: {
            $sum: {
              $cond: [{ $eq: ["$metalType", "Gold"] }, 1, 0],
            },
          },
          totalSilver: {
            $sum: {
              $cond: [{ $eq: ["$metalType", "Silver"] }, 1, 0],
            },
          },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0],
            },
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0],
            },
          },
          totalAmount: { $sum: "$totals.totalInvoiceAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

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

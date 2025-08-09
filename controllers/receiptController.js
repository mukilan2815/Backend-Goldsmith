const mongoose = require("mongoose");
const Receipt = require("../models/receiptModel");
const Client = require("../models/clientModel"); // Assuming the Client model is in the same directory

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
    // Get client's current balance
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Prepare givenItems from possible payload keys (make a copy to avoid mutating input)
    let givenItems =
      (req.body.items && [...req.body.items]) ||
      (req.body.givenItems && [...req.body.givenItems]) ||
      (req.body.tableData && [...req.body.tableData]) ||
      [];

    // Add previous balance as first given item if balance exists
    if (client.balance > 0) {
      givenItems.unshift({
        itemName: "Previous Balance",
        tag: "BALANCE",
        grossWt: client.balance,
        stoneWt: 0,
        meltingTouch: 100, // Assume 100% for previous balance
        netWt: client.balance,
        finalWt: client.balance,
        stoneAmt: 0,
      });
    }

    // Prepare receivedItems
    const receivedItems =
      (req.body.receivedData && [...req.body.receivedData]) ||
      (req.body.receivedItems && [...req.body.receivedItems]) ||
      [];

    // Compute totals for balance calculation
    let totalFinal = 0;
    let receivedFinal = 0;
    givenItems.forEach((it) => {
      totalFinal += parseFloat(it.finalWt?.toString() || "0");
    });
    receivedItems.forEach((r) => {
      receivedFinal += parseFloat(r.finalWt?.toString() || "0");
    });

    const balanceChange = parseFloat((totalFinal - receivedFinal).toFixed(3));
    const newClientBalance = parseFloat(
      (client.balance + balanceChange).toFixed(3)
    );

    // Optionally update client balance here if you want atomicity
    client.balance = newClientBalance;
    await client.save();

    const receiptData = {
      clientId: req.body.clientId,
      clientInfo: req.body.clientInfo,
      metalType: req.body.metalType,
      issueDate: new Date(req.body.issueDate),
      voucherId: req.body.voucherId,
      status:
        req.body.status ||
        (receivedItems.length > 0 ? "complete" : "incomplete"),
      givenItems,
      receivedItems,
      previousBalance: client.balance,
      finalWtBalanceTag: req.body.finalWtBalanceTag || ""
    };

    const receipt = await Receipt.create(receiptData);

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

const updateReceipt = async (req, res) => {
  try {
    // Map frontend data to our model structure
    const updateData = {
      ...req.body,
      givenItems: req.body.items || req.body.givenItems || req.body.tableData,
      receivedItems: req.body.receivedData || req.body.receivedItems,
    };
    
    // Include finalWtBalanceTag in update if provided
    if (req.body.finalWtBalanceTag !== undefined) {
      updateData.finalWtBalanceTag = req.body.finalWtBalanceTag;
    }

    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    // Find the latest voucher by sorting voucherId descending
    const latestVoucher = await Receipt.findOne({})
      .sort({ voucherId: -1 })
      .lean();

    let nextNumber = 1;
    if (latestVoucher && latestVoucher.voucherId) {
      const match = latestVoucher.voucherId.match(/SH-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const voucherId = `SH-${nextNumber.toString().padStart(3, "0")}`;

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
// Add this new method to get client balance
const getClientBalance = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    res.status(200).json({
      success: true,
      balance: client.balance,
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
  getClientBalance,
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

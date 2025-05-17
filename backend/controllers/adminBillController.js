
const AdminReceipt = require('../models/adminReceiptModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all admin bills
// @route   GET /api/admin-bills
// @access  Public
const getAdminBills = asyncHandler(async (req, res) => {
  const { clientName, dateFrom, dateTo, status, receiptId } = req.query;
  
  let query = {};
  
  // If a specific receiptId is provided, return just that receipt
  if (receiptId) {
    try {
      const receipt = await AdminReceipt.findById(receiptId);
      if (receipt) {
        return res.json([receipt]);
      } else {
        return res.status(404).json({ message: 'Receipt not found' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid receipt ID' });
    }
  }
  
  // Filter by client name if provided
  if (clientName) {
    query.clientName = { $regex: clientName, $options: 'i' };
  }
  
  // Filter by date range if provided
  if (dateFrom || dateTo) {
    query.$or = [];
    
    const dateFilter = {};
    if (dateFrom) {
      dateFilter.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.$lte = new Date(dateTo);
    }
    
    if (Object.keys(dateFilter).length > 0) {
      query.$or.push({ 'given.date': dateFilter });
      query.$or.push({ 'received.date': dateFilter });
      query.$or.push({ createdAt: dateFilter });
    }
  }
  
  // Filter by status if provided
  if (status) {
    query.status = status;
  }
  
  // If no $or conditions were added, remove the $or property
  if (query.$or && query.$or.length === 0) {
    delete query.$or;
  }
  
  const adminBills = await AdminReceipt.find(query).sort({ createdAt: -1 });
  res.json(adminBills);
});

// @desc    Get admin bill by ID
// @route   GET /api/admin-bills/:id
// @access  Public
const getAdminBillById = asyncHandler(async (req, res) => {
  const adminBill = await AdminReceipt.findById(req.params.id);
  
  if (adminBill) {
    res.json(adminBill);
  } else {
    res.status(404);
    throw new Error('Admin bill not found');
  }
});

// @desc    Delete admin bill
// @route   DELETE /api/admin-bills/:id
// @access  Public
const deleteAdminBill = asyncHandler(async (req, res) => {
  const adminBill = await AdminReceipt.findById(req.params.id);
  
  if (adminBill) {
    await adminBill.deleteOne();
    res.json({ message: 'Admin bill removed' });
  } else {
    res.status(404);
    throw new Error('Admin bill not found');
  }
});

module.exports = {
  getAdminBills,
  getAdminBillById,
  deleteAdminBill,
};


const Receipt = require('../models/receiptModel');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

// @desc    Get all client bills
// @route   GET /api/bills
// @access  Public
const getClientBills = asyncHandler(async (req, res) => {
  // This effectively returns all receipts, as they are the bills
  // We can add filtering options here
  const { clientName, shopName, phoneNumber, startDate, endDate } = req.query;
  
  let query = {};
  
  // Filter by client info if provided
  if (clientName) {
    query['clientInfo.clientName'] = { $regex: clientName, $options: 'i' };
  }
  
  if (shopName) {
    query['clientInfo.shopName'] = { $regex: shopName, $options: 'i' };
  }
  
  if (phoneNumber) {
    query['clientInfo.phoneNumber'] = { $regex: phoneNumber, $options: 'i' };
  }
  
  // Filter by date range if provided
  if (startDate || endDate) {
    query.issueDate = {};
    
    if (startDate) {
      query.issueDate.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.issueDate.$lte = new Date(endDate);
    }
  }
  
  const bills = await Receipt.find(query).sort({ issueDate: -1 });
  res.json(bills);
});

// @desc    Get client bill by ID
// @route   GET /api/bills/:id
// @access  Public
const getClientBillById = asyncHandler(async (req, res) => {
  const bill = await Receipt.findById(req.params.id);
  
  if (bill) {
    res.json(bill);
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Delete client bill
// @route   DELETE /api/bills/:id
// @access  Public
const deleteBill = asyncHandler(async (req, res) => {
  // This effectively deletes a receipt as bills are just receipts
  const bill = await Receipt.findById(req.params.id);
  
  if (bill) {
    await bill.deleteOne();
    res.json({ message: 'Bill removed' });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Download bill as PDF
// @route   GET /api/bills/:id/download
// @access  Public
const downloadBillPDF = asyncHandler(async (req, res) => {
  const bill = await Receipt.findById(req.params.id);
  
  if (bill) {
    // In a real implementation, you would generate a PDF here
    // For now, we'll just send back the bill data with a note that PDF generation would happen here
    res.json({
      message: 'PDF generation would happen here',
      bill: bill
    });
    
    // PDF generation typically involves libraries like PDFKit or using a service
    // Example with PDFKit (you'd need to install pdfkit npm package):
    /*
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${bill.voucherId}.pdf`);
    
    // Pipe the PDF document to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(25).text('Bill Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Voucher ID: ${bill.voucherId}`);
    doc.text(`Client: ${bill.clientInfo.clientName}`);
    doc.text(`Shop: ${bill.clientInfo.shopName}`);
    doc.text(`Date: ${new Date(bill.issueDate).toLocaleDateString()}`);
    // Add more content as needed
    
    // Finalize the PDF and end the response
    doc.end();
    */
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

module.exports = {
  getClientBills,
  getClientBillById,
  deleteBill,
  downloadBillPDF,
};

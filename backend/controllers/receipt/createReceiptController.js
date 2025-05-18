
const Receipt = require('../../models/receiptModel');
const asyncHandler = require('express-async-handler');
const { 
  generateVoucherId, 
  validateClient,
  preparePaymentData,
  prepareReceiptItems,
  calculateTotalInvoiceAmount
} = require('../../utils/receiptUtils');

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
      client = await validateClient(clientId);
    } catch (error) {
      if (error.message === 'Client not found') {
        res.status(404);
        throw error;
      }
      res.status(500);
      throw error;
    }
  }

  // Generate unique voucher ID if not provided
  let finalVoucherId = voucherId;
  if (!finalVoucherId) {
    finalVoucherId = await generateVoucherId();
  }

  try {
    // Handle both formats - tableData array or items array
    const receiptItems = prepareReceiptItems(tableData, items);

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
      totalInvoiceAmount = calculateTotalInvoiceAmount(receiptItems);
    }

    // Initialize payment tracking
    const paymentData = preparePaymentData(payments, totalPaidAmount, balanceDue, paymentStatus, totalInvoiceAmount);

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
      payments: paymentData.payments,
      totalPaidAmount: paymentData.totalPaidAmount,
      balanceDue: paymentData.balanceDue,
      paymentStatus: paymentData.paymentStatus,
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

module.exports = {
  createReceipt
};

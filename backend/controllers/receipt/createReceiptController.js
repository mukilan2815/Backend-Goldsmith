
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
    shopName, 
    phoneNumber, 
    metalType, 
    overallWeight,
    issueDate, 
    tableData, 
    totals, 
    voucherId
  } = req.body;

  // Validate required fields
  if (!clientId || !clientName || !metalType || !issueDate || !tableData || !voucherId) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  try {
    // Validate client exists if ID is provided
    let client = null;
    if (clientId && !clientId.includes('temp-')) {
      try {
        client = await validateClient(clientId);
      } catch (error) {
        console.log('Client validation error:', error.message);
        // We'll continue without client validation for now
      }
    }

    // Ensure tableData items have all required fields converted to strings
    const formattedTableData = tableData.map(item => ({
      itemName: item.itemName || "",
      tag: item.tag || "",
      grossWt: typeof item.grossWt === 'number' ? item.grossWt.toString() : (item.grossWt || "0"),
      stoneWt: typeof item.stoneWt === 'number' ? item.stoneWt.toString() : (item.stoneWt || "0"),
      meltingTouch: typeof item.meltingTouch === 'number' ? item.meltingTouch.toString() : (item.meltingTouch || "0"),
      stoneAmt: typeof item.stoneAmt === 'number' ? item.stoneAmt.toString() : (item.stoneAmt || "0")
    }));

    // Format totals to ensure they're all numbers
    const formattedTotals = {
      grossWt: parseFloat(totals.grossWt) || 0,
      stoneWt: parseFloat(totals.stoneWt) || 0,
      netWt: parseFloat(totals.netWt) || 0,
      finalWt: parseFloat(totals.finalWt) || 0,
      stoneAmt: parseFloat(totals.stoneAmt) || 0
    };

    // Create the receipt document with required format
    const receiptData = {
      clientId,
      clientInfo: {
        clientName: clientName || "",
        shopName: shopName || "",
        phoneNumber: phoneNumber || ""
      },
      metalType,
      overallWeight: parseFloat(overallWeight) || 0,
      issueDate: new Date(issueDate),
      voucherId,
      items: formattedTableData,
      totals: formattedTotals
    };

    console.log("Creating receipt with formatted data:", JSON.stringify(receiptData));
    
    // Save to MongoDB
    const receipt = await Receipt.create(receiptData);

    if (receipt) {
      res.status(201).json({
        success: true,
        voucherId: receipt.voucherId,
        _id: receipt._id
      });
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

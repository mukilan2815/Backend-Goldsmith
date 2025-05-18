
const Receipt = require('../models/receiptModel');
const Client = require('../models/clientModel');

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

// Helper to validate client
const validateClient = async (clientId) => {
  if (!clientId || clientId === 'temp-id' || clientId.includes('temp-')) {
    return null;
  }
  
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  } catch (error) {
    console.log('Client validation error:', error.message);
    // If it's not a "Client not found" error but a database error
    if (error.message !== 'Client not found') {
      console.error('Database error during client lookup:', error);
      throw new Error('Database error during client validation');
    }
    throw error; // Re-throw the "Client not found" error
  }
};

// Helper to prepare payment data from request
const preparePaymentData = (payments, totalPaidAmount, balanceDue, paymentStatus, totalInvoiceAmount) => {
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
  
  return {
    payments: paymentsData,
    totalPaidAmount: totalPaidAmountValue,
    balanceDue: balanceDueValue,
    paymentStatus: paymentStatusValue
  };
};

// Helper to prepare receipt items from request
const prepareReceiptItems = (tableData, items) => {
  let receiptItems = [];
  
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
  }
  
  return receiptItems;
};

// Helper to calculate total invoice amount from items
const calculateTotalInvoiceAmount = (items) => {
  return items.reduce((sum, item) => sum + (parseFloat(item.totalInvoiceAmount) || 0), 0);
};

module.exports = {
  generateVoucherId,
  validateClient,
  preparePaymentData,
  prepareReceiptItems,
  calculateTotalInvoiceAmount
};

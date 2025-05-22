const Receipt = require("../../models/receiptModel");
const asyncHandler = require("express-async-handler");
const createReceipt = asyncHandler(async (req, res) => {
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
    voucherId,
  } = req.body;
  const requiredFields = [
    "clientId",
    "clientName",
    "metalType",
    "issueDate",
    "tableData",
    "voucherId",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  try {
    const receiptData = {
      clientId,
      clientInfo: {
        clientName: clientName || "",
        shopName: shopName || "",
        phoneNumber: phoneNumber || "",
      },
      metalType,
      overallWeight: parseFloat(overallWeight) || 0,
      issueDate: new Date(issueDate),
      voucherId,
      items: tableData,
      totals: {
        grossWt: parseFloat(totals?.grossWt) || 0,
        stoneWt: parseFloat(totals?.stoneWt) || 0,
        netWt: parseFloat(totals?.netWt) || 0,
        finalWt: parseFloat(totals?.finalWt) || 0,
        stoneAmt: parseFloat(totals?.stoneAmt) || 0,
      },
    };
    const receipt = await Receipt.create(receiptData);
    res.status(201).json({
      success: true,
      voucherId: receipt.voucherId,
      _id: receipt._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create receipt",
    });
  }
});
module.exports = {
  createReceipt,
};

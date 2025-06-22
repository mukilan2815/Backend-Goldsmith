const Receipt = require("../../models/receiptModel");
const Client = require("../../models/clientModel");
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
    receivedData,
    totals,
    voucherId,
  } = req.body;

  // Validate required fields
  const requiredFields = [
    "clientId",
    "clientName",
    "metalType",
    "issueDate",
    "tableData",
    "voucherId",
  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Validate items
  let itemErrors = [];
  if (!Array.isArray(tableData) {
    itemErrors.push({
      message: "Items must be an array",
      type: "invalid_type"
    });
  } else if (tableData.length === 0) {
    itemErrors.push({
      message: "At least one item is required",
      type: "too_small"
    });
  } else {
    tableData.forEach((item, idx) => {
      const errors = {};
      if (!item.itemName || item.itemName.trim() === "") {
        errors.itemName = {
          message: "Item name is required",
          type: "too_small"
        };
      }
      if (!(parseFloat(item.grossWt) > 0)) {
        errors.grossWt = {
          message: "Gross weight is required and must be positive",
          type: "too_small"
        };
      }
      if (parseFloat(item.stoneWt) > parseFloat(item.grossWt)) {
        errors.stoneWt = {
          message: "Stone weight cannot exceed gross weight",
          type: "too_big"
        };
      }
      if (Object.keys(errors).length > 0) {
        itemErrors.push({
          index: idx,
          ...errors
        });
      }
    });
  }

  if (itemErrors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: {
        items: itemErrors
      }
    });
  }

  try {
    // Get client's current balance
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const previousBalance = client.balance || 0;

    // Process items data
    const processedItems = tableData.map((item) => ({
      itemName: item.itemName || "",
      tag: item.tag || "",
      grossWt: parseFloat(item.grossWt) || 0,
      stoneWt: parseFloat(item.stoneWt) || 0,
      meltingTouch: parseFloat(item.meltingTouch) || 0,
      netWt: parseFloat(item.netWt) || 0,
      finalWt: parseFloat(item.finalWt) || 0,
      stoneAmt: parseFloat(item.stoneAmt) || 0,
    }));

    // Process received items
    const processedReceivedItems = (receivedData || []).map((item) => ({
      receivedGold: parseFloat(item.receivedGold) || 0,
      melting: parseFloat(item.melting) || 0,
      finalWt: parseFloat(item.finalWt) || 0,
    }));

    // Calculate totals
    const calculatedTotals = processedItems.reduce(
      (acc, item) => {
        const netWt = item.grossWt - item.stoneWt;
        const finalWt = (netWt * item.meltingTouch) / 100;
        
        return {
          grossWt: acc.grossWt + item.grossWt,
          stoneWt: acc.stoneWt + item.stoneWt,
          netWt: acc.netWt + netWt,
          finalWt: acc.finalWt + finalWt,
          stoneAmt: acc.stoneAmt + (item.stoneAmt || 0),
        };
      },
      { grossWt: 0, stoneWt: 0, netWt: 0, finalWt: 0, stoneAmt: 0 }
    );

    // Calculate received totals
    const receivedTotals = processedReceivedItems.reduce(
      (acc, item) => ({
        finalWt: acc.finalWt + ((item.receivedGold * item.melting) / 100)
      }),
      { finalWt: 0 }
    );

    // Calculate balance
    const balance = calculatedTotals.finalWt - receivedTotals.finalWt;
    const newBalance = previousBalance + balance;

    // Create receipt data
    const receiptData = {
      clientId,
      clientInfo: {
        clientName,
        shopName: shopName || "",
        phoneNumber: phoneNumber || "",
        metalType,
      },
      metalType,
      issueDate: new Date(issueDate),
      voucherId,
      givenItems: processedItems,
      receivedItems: processedReceivedItems,
      totals: calculatedTotals,
      previousBalance,
      balance,
      newBalance,
      isCompleted: balance <= 0, // Mark as completed if balance is settled
    };

    // Create receipt
    const receipt = await Receipt.create(receiptData);

    // Update client balance
    client.balance = newBalance;
    await client.save();

    res.status(201).json({
      success: true,
      data: {
        _id: receipt._id,
        voucherId: receipt.voucherId,
        balance: receipt.balance,
        newBalance,
      },
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create receipt",
    });
  }
});

module.exports = {
  createReceipt,
};
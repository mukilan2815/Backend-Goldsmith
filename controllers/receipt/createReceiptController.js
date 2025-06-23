const Receipt = require("../../models/receiptModel");
const Client = require("../../models/clientModel");
const asyncHandler = require("express-async-handler");
const { validateReceiptData } = require("../../utils/validators");

const createReceipt = asyncHandler(async (req, res) => {
  // Destructure with default values
  const {
    clientId,
    clientName = "",
    shopName = "",
    phoneNumber = "",
    metalType,
    issueDate,
    tableData = [],
    receivedData = [],
    voucherId,
  } = req.body;

  const validation = validateReceiptData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    // Get client with transaction to ensure data consistency
    const client = await Client.findById(clientId).session(req.session);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Process items with additional validation
    const processedItems = tableData.map((item, index) => {
      const grossWt = parseFloat(item.grossWt) || 0;
      const stoneWt = parseFloat(item.stoneWt) || 0;
      const meltingTouch = Math.min(
        Math.max(parseFloat(item.meltingTouch) || 0, 0),
        100
      );
      const netWt = grossWt - stoneWt;
      const finalWt = (netWt * meltingTouch) / 100;

      return {
        itemName: item.itemName?.trim() || `Item ${index + 1}`,
        tag: item.tag?.trim() || "",
        grossWt,
        stoneWt,
        meltingTouch,
        netWt,
        finalWt,
        stoneAmt: parseFloat(item.stoneAmt) || 0,
        _id: item._id || new mongoose.Types.ObjectId(),
      };
    });

    // Process received items with calculated fields
    const processedReceivedItems = receivedData.map((item, index) => {
      const receivedGold = parseFloat(item.receivedGold) || 0;
      const melting = Math.min(Math.max(parseFloat(item.melting) || 0, 0), 100);
      const finalWt = (receivedGold * melting) / 100;

      return {
        sNo: index + 1,
        receivedGold,
        melting,
        finalWt,
        description: item.description?.trim() || "",
        _id: item._id || new mongoose.Types.ObjectId(),
      };
    });

    // Calculate totals
    const { totals, balance } = calculateReceiptTotals(
      processedItems,
      processedReceivedItems,
      client.balance || 0
    );

    // Prepare receipt document
    const receiptData = {
      clientId,
      clientInfo: {
        clientName: clientName.trim(),
        shopName: shopName.trim(),
        phoneNumber: phoneNumber.trim(),
      },
      metalType,
      issueDate: new Date(issueDate),
      voucherId,
      givenItems: processedItems,
      receivedItems: processedReceivedItems,
      totals,
      previousBalance: client.balance || 0,
      balance,
      newBalance: (client.balance || 0) + balance,
      isCompleted: balance <= 0,
      createdBy: req.user?._id, // Track who created the receipt
    };

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create receipt
      const receipt = await Receipt.create([receiptData], { session });

      // Update client balance
      client.balance = receiptData.newBalance;
      await client.save({ session });

      // Commit transaction
      await session.commitTransaction();

      res.status(201).json({
        success: true,
        data: {
          _id: receipt[0]._id,
          voucherId: receipt[0].voucherId,
          balance: receipt[0].balance,
          newBalance: receipt[0].newBalance,
          isCompleted: receipt[0].isCompleted,
        },
        message: "Receipt created successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("[Receipt Creation Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create receipt",
      errorCode: "RECEIPT_CREATION_FAILED",
    });
  }
});

// Helper function to calculate receipt totals
function calculateReceiptTotals(
  givenItems,
  receivedItems,
  previousBalance = 0
) {
  const givenTotals = givenItems.reduce(
    (acc, item) => ({
      grossWt: acc.grossWt + item.grossWt,
      stoneWt: acc.stoneWt + item.stoneWt,
      netWt: acc.netWt + item.netWt,
      finalWt: acc.finalWt + item.finalWt,
      stoneAmt: acc.stoneAmt + item.stoneAmt,
    }),
    { grossWt: 0, stoneWt: 0, netWt: 0, finalWt: 0, stoneAmt: 0 }
  );

  const receivedTotals = receivedItems.reduce(
    (acc, item) => ({
      receivedGold: acc.receivedGold + item.receivedGold,
      finalWt: acc.finalWt + item.finalWt,
    }),
    { receivedGold: 0, finalWt: 0 }
  );

  const balance = givenTotals.finalWt - receivedTotals.finalWt;

  return {
    totals: {
      ...givenTotals,
      receivedGold: receivedTotals.receivedGold,
      receivedFinalWt: receivedTotals.finalWt,
    },
    balance,
  };
}

module.exports = {
  createReceipt,
};

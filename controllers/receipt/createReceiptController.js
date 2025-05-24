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

  try {
    // Process items data to ensure numeric values are properly parsed
    // Map from frontend field names to database field names
    const processedItems = Array.isArray(tableData)
      ? tableData.map((item) => {
          // Get values from frontend field names
          const grossWeight = parseFloat(item.grossWeight) || 0;
          const stoneWeight = parseFloat(item.stoneWeight) || 0;
          const netWeight = parseFloat(item.netWeight) || 0;
          const finalWeight = parseFloat(item.finalWeight) || 0;
          const stoneAmount = parseFloat(item.stoneAmount) || 0;

          // Log the values for debugging
          console.log("Processing item:", {
            itemName: item.itemName,
            grossWeight,
            stoneWeight,
            netWeight,
            finalWeight,
            stoneAmount,
          });

          return {
            itemName: item.itemName || "",
            // Store using database field names
            grossWt: grossWeight,
            stoneWt: stoneWeight,
            netWt: netWeight,
            finalWt: finalWeight,
            stoneAmt: stoneAmount,
            // Preserve any other fields
            ...(item.tag && { tag: item.tag }),
            ...(item.meltingPercent && {
              meltingTouch: parseFloat(item.meltingPercent) || 0,
            }),
            ...(item.amount && {
              totalInvoiceAmount: parseFloat(item.amount) || 0,
            }),
          };
        })
      : [];

    // Process totals with correct field mapping
    const processedTotals = {
      // Map from frontend totals to database field names
      grossWt: parseFloat(totals?.grossWt) || 0,
      stoneWt: parseFloat(totals?.stoneWt) || 0,
      netWt: parseFloat(totals?.netWt) || 0,
      finalWt: parseFloat(totals?.finalWt) || 0,
      stoneAmt: parseFloat(totals?.stoneAmt) || 0,
    };

    // Create receipt data object with proper numeric parsing
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
      items: processedItems,
      totals: processedTotals,
      // Preserve any other fields from the request
      ...(req.body.paymentStatus && { paymentStatus: req.body.paymentStatus }),
      ...(req.body.isCompleted !== undefined && {
        isCompleted: req.body.isCompleted,
      }),
      ...(req.body.balanceDue !== undefined && {
        balanceDue: parseFloat(req.body.balanceDue) || 0,
      }),
      ...(req.body.totalPaidAmount !== undefined && {
        totalPaidAmount: parseFloat(req.body.totalPaidAmount) || 0,
      }),
      ...(req.body.payments && { payments: req.body.payments }),
    };

    // Debug log to verify data before saving
    console.log(
      "Creating receipt with data:",
      JSON.stringify(receiptData, null, 2)
    );

    const receipt = await Receipt.create(receiptData);

    res.status(201).json({
      success: true,
      voucherId: receipt.voucherId,
      _id: receipt._id,
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create receipt",
    });
  }
});

module.exports = {
  createReceipt,
};

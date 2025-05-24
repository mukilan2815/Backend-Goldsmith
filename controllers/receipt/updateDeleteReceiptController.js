const Receipt = require("../../models/receiptModel");
const asyncHandler = require("express-async-handler");

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Public
const updateReceipt = asyncHandler(async (req, res) => {
  const {
    metalType,
    issueDate,
    items,
    totals,
    notes,
    deliveryDate,
    isCompleted,
    payments,
    totalPaidAmount,
    balanceDue,
    paymentStatus,
  } = req.body;

  const receipt = await Receipt.findById(req.params.id);

  if (receipt) {
    // Calculate totals if items were updated
    let updatedTotals = totals;
    if (items && !totals) {
      updatedTotals = {
        grossWt: 0,
        stoneWt: 0,
        netWt: 0,
        finalWt: 0,
        stoneAmt: 0,
        totalInvoiceAmount: 0,
      };

      items.forEach((item) => {
        updatedTotals.grossWt += Number(item.grossWt);
        updatedTotals.stoneWt += Number(item.stoneWt);
        updatedTotals.stoneAmt += Number(item.stoneAmt);
        updatedTotals.totalInvoiceAmount += Number(
          item.totalInvoiceAmount || 0
        );
      });

      updatedTotals.netWt = updatedTotals.grossWt - updatedTotals.stoneWt;
      // Use first item's melting touch as reference if available
      const meltingTouch =
        items[0]?.meltingTouch || receipt.items[0]?.meltingTouch || 100;
      updatedTotals.finalWt = updatedTotals.netWt * (meltingTouch / 100);
    }

    // Calculate payment totals if payments were updated
    let updatedPayments = payments || receipt.payments;
    let updatedTotalPaid = totalPaidAmount;

    if (payments && !totalPaidAmount) {
      updatedTotalPaid = payments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0
      );
    }

    // Calculate balance due if needed
    let updatedBalanceDue = balanceDue;
    if ((updatedTotals || totals || items) && (payments || totalPaidAmount)) {
      const invoiceAmount =
        updatedTotals?.totalInvoiceAmount ||
        totals?.totalInvoiceAmount ||
        receipt.totals.totalInvoiceAmount;
      updatedBalanceDue =
        invoiceAmount - (updatedTotalPaid || receipt.totalPaidAmount);
    }

    // Determine payment status if not provided
    let updatedPaymentStatus = paymentStatus;
    if (
      !paymentStatus &&
      (updatedBalanceDue !== undefined || updatedTotalPaid !== undefined)
    ) {
      const invoiceAmount =
        updatedTotals?.totalInvoiceAmount ||
        totals?.totalInvoiceAmount ||
        receipt.totals.totalInvoiceAmount;
      const finalBalanceDue =
        updatedBalanceDue !== undefined
          ? updatedBalanceDue
          : receipt.balanceDue;
      const finalTotalPaid =
        updatedTotalPaid !== undefined
          ? updatedTotalPaid
          : receipt.totalPaidAmount;

      if (invoiceAmount <= 0) {
        updatedPaymentStatus = "Paid";
      } else if (finalBalanceDue <= 0) {
        updatedPaymentStatus = "Paid";
      } else if (finalTotalPaid > 0 && finalBalanceDue > 0) {
        updatedPaymentStatus = "Partially Paid";
      } else {
        updatedPaymentStatus = "Pending";
      }
    }

    receipt.metalType = metalType || receipt.metalType;
    receipt.issueDate = issueDate || receipt.issueDate;
    receipt.items = items || receipt.items;
    receipt.totals = updatedTotals || receipt.totals;
    receipt.notes = notes !== undefined ? notes : receipt.notes;
    receipt.deliveryDate =
      deliveryDate !== undefined ? deliveryDate : receipt.deliveryDate;
    receipt.isCompleted =
      isCompleted !== undefined ? isCompleted : receipt.isCompleted;

    // Update payment tracking fields
    receipt.payments = updatedPayments;
    if (updatedTotalPaid !== undefined)
      receipt.totalPaidAmount = updatedTotalPaid;
    if (updatedBalanceDue !== undefined) receipt.balanceDue = updatedBalanceDue;
    if (updatedPaymentStatus !== undefined)
      receipt.paymentStatus = updatedPaymentStatus;

    const updatedReceipt = await receipt.save();
    res.json(updatedReceipt);
  } else {
    res.status(404);
    throw new Error("Receipt not found");
  }
});

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Public
const deleteReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);

  if (receipt) {
    await receipt.deleteOne();
    res.json({ message: "Receipt removed" });
  } else {
    res.status(404);
    throw new Error("Receipt not found");
  }
});

module.exports = {
  updateReceipt,
  deleteReceipt,
};

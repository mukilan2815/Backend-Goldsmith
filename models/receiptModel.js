const mongoose = require("mongoose");

const receiptItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required."],
      trim: true,
    },
    description: { type: String, trim: true, default: "" },
    tag: { type: String, trim: true, default: "" },
    grossWt: {
      type: Number,
      required: [true, "Gross weight is required."],
      default: 0,
    },
    stoneWt: { type: Number, default: 0 },
    netWt: { type: Number, default: 0 },
    meltingTouch: {
      type: Number,
      default: 0,
      min: [0, "Melting touch cannot be negative"],
      max: [100, "Melting touch cannot exceed 100%"],
    },
    finalWt: { type: Number, default: 0 },
    stoneAmt: { type: Number, default: 0 },
    totalInvoiceAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentDate: { type: Date, default: Date.now },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0.01, "Payment amount must be positive"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: [
        "Cash",
        "Bank Transfer",
        "Credit Card",
        "Debit Card",
        "Cheque",
        "Online Payment",
        "Other",
      ],
    },
    referenceNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const receiptSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required."],
    },
    clientInfo: {
      clientName: {
        type: String,
        required: [true, "Client name in clientInfo is required."],
        trim: true,
      },
      shopName: { type: String, trim: true, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
      metalType: { type: String, trim: true },
    },
    metalType: {
      type: String,
      required: [true, "Metal type is required."],
      trim: true,
    },
    issueDate: { type: Date, required: true, default: Date.now },
    deliveryDate: { type: Date },
    voucherId: { type: String, trim: true, unique: true },
    items: [receiptItemSchema],
    totals: {
      grossWt: { type: Number, default: 0 },
      stoneWt: { type: Number, default: 0 },
      netWt: { type: Number, default: 0 },
      finalWt: { type: Number, default: 0 },
      stoneAmt: { type: Number, default: 0 },
      totalInvoiceAmount: { type: Number, default: 0 },
    },
    payments: [paymentSchema],
    totalPaidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid", "Overdue", "Cancelled"],
      default: "Pending",
    },
    notes: { type: String, trim: true },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

receiptSchema.pre("save", function (next) {
  let totalGrossWt = 0;
  let totalStoneWt = 0;
  let totalNetWt = 0;
  let totalFinalWt = 0;
  let totalStoneAmt = 0;
  let totalInvoiceAmount = 0;
  let totalMeltingTouch = 0;

  this.items.forEach((item) => {
    // Preserve manually entered values
    if (typeof item.netWt === "undefined" || item.netWt === null) {
      item.netWt = parseFloat((item.grossWt || 0) - (item.stoneWt || 0));
    }

    if (typeof item.finalWt === "undefined" || item.finalWt === null) {
      item.finalWt = parseFloat(
        ((item.netWt * (item.meltingTouch || 0)) / 100).toFixed(3)
      );
    }

    // Accumulate totals
    totalGrossWt += item.grossWt || 0;
    totalStoneWt += item.stoneWt || 0;
    totalNetWt += item.netWt || 0;
    totalFinalWt += item.finalWt || 0;
    totalStoneAmt += item.stoneAmt || 0;
    totalInvoiceAmount += item.totalInvoiceAmount || 0;
    totalMeltingTouch += item.meltingTouch || 0;
  });

  this.totals = {
    grossWt: parseFloat(totalGrossWt.toFixed(3)),
    stoneWt: parseFloat(totalStoneWt.toFixed(3)),
    netWt: parseFloat(totalNetWt.toFixed(3)),
    finalWt: parseFloat(totalFinalWt.toFixed(3)),
    stoneAmt: parseFloat(totalStoneAmt.toFixed(2)),
    meltingTouch: parseFloat(totalMeltingTouch.toFixed(2)), // Added this line
    totalInvoiceAmount: parseFloat(totalInvoiceAmount.toFixed(2)),
  };

  let totalPaid = 0;
  this.payments.forEach((payment) => {
    totalPaid += payment.amountPaid;
  });

  this.totalPaidAmount = parseFloat(totalPaid.toFixed(2));
  this.balanceDue = parseFloat(
    (this.totals.totalInvoiceAmount - this.totalPaidAmount).toFixed(2)
  );

  if (this.balanceDue <= 0) {
    this.paymentStatus = "Paid";
  } else if (this.totalPaidAmount > 0) {
    this.paymentStatus = "Partially Paid";
  } else {
    this.paymentStatus = "Pending";
  }

  next();
});

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;


const mongoose = require('mongoose');

// Define the schema for individual items within a receipt
const receiptItemSchema = new mongoose.Schema({
    itemName: { type: String, required: [true, "Item name is required."], trim: true },
    tag: { type: String, trim: true, default: '' },
    grossWt: { type: Number, required: [true, "Gross weight is required."], default: 0, min: [0, "Gross weight cannot be negative."] },
    stoneWt: { type: Number, default: 0, min: [0, "Stone weight cannot be negative."] },
    netWt: { type: Number, default: 0 }, // Calculated: grossWt - stoneWt
    meltingTouch: { type: Number, required: [true, "Melting touch is required."], default: 0, min: [0, "Melting touch cannot be negative."] }, // Percentage
    finalWt: { type: Number, default: 0 }, // Calculated: netWt * (meltingTouch / 100)
    stoneAmt: { type: Number, default: 0, min: [0, "Stone amount cannot be negative."] }
}, { _id: false }); // No separate _id for these sub-documents

const receiptSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, "Client ID is required."],
      index: true
    },
    clientInfo: {
      clientName: { type: String, required: [true, "Client name in clientInfo is required."], trim: true },
      shopName: { type: String, trim: true, default: '' },
      phoneNumber: { type: String, trim: true, default: '' }
    },
    metalType: { type: String, required: [true, "Metal type is required."], trim: true },
    issueDate: { type: Date, required: true, default: Date.now },
    deliveryDate: { type: Date },
    voucherId: { type: String, trim: true, unique: true },
    items: [receiptItemSchema], // Array of items
    totals: {
      grossWt: { type: Number, default: 0 },
      stoneWt: { type: Number, default: 0 },
      netWt: { type: Number, default: 0 },
      finalWt: { type: Number, default: 0 },
      stoneAmt: { type: Number, default: 0 }
    },
    notes: { type: String, trim: true },
    isCompleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totals
receiptSchema.pre('save', function(next) {
  let totalGrossWt = 0;
  let totalStoneWt = 0;
  let totalNetWt = 0;
  let totalFinalWt = 0;
  let totalStoneAmt = 0;

  this.items.forEach(item => {
    item.netWt = parseFloat((item.grossWt || 0) - (item.stoneWt || 0));
    // Ensure meltingTouch is treated as a percentage
    item.finalWt = parseFloat((item.netWt * ((item.meltingTouch || 0) / 100)).toFixed(3));

    // Accumulate totals
    totalGrossWt += (item.grossWt || 0);
    totalStoneWt += (item.stoneWt || 0);
    totalNetWt += item.netWt;
    totalFinalWt += item.finalWt;
    totalStoneAmt += (item.stoneAmt || 0);
  });

  this.totals = {
    grossWt: parseFloat(totalGrossWt.toFixed(3)),
    stoneWt: parseFloat(totalStoneWt.toFixed(3)),
    netWt: parseFloat(totalNetWt.toFixed(3)),
    finalWt: parseFloat(totalFinalWt.toFixed(3)),
    stoneAmt: parseFloat(totalStoneAmt.toFixed(2))
  };
  
  next();
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;

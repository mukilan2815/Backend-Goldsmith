const mongoose = require("mongoose");

const receiptItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      trim: true,
    },
    tag: { type: String, trim: true, default: "" },
    grossWt: {
      type: Number,
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
  },
  { _id: false }
);

const receivedItemSchema = new mongoose.Schema(
  {
    receivedGold: { type: Number, default: 0 },
    melting: { type: Number, default: 0 },
    finalWt: { type: Number, default: 0 },
  },
  { _id: false }
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
    voucherId: { type: String, trim: true, unique: true },
    givenItems: [receiptItemSchema],
    receivedItems: [receivedItemSchema],
    totals: {
      grossWt: { type: Number, default: 0 },
      stoneWt: { type: Number, default: 0 },
      netWt: { type: Number, default: 0 },
      finalWt: { type: Number, default: 0 },
      stoneAmt: { type: Number, default: 0 },
    },
    balance: { type: Number, default: 0 }, // This receipt's balance
    previousBalance: { type: Number, default: 0 }, // Client's balance before this receipt
    newBalance: { type: Number, default: 0 }, // Client's new balance after this receipt
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totals and update client balance
receiptSchema.pre("save", async function (next) {
  // Calculate given items totals
  const givenTotals = this.givenItems.reduce(
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

  // Calculate received items totals
  const receivedTotals = this.receivedItems.reduce(
    (acc, item) => {
      const finalWt = (item.receivedGold * item.melting) / 100;
      return {
        finalWt: acc.finalWt + finalWt,
      };
    },
    { finalWt: 0 }
  );

  // Get client's current balance
  const Client = mongoose.model("Client");
  const client = await Client.findById(this.clientId);

  // Store previous balance
  this.previousBalance = client.balance || 0;

  // Calculate this receipt's balance
  this.balance = parseFloat(
    (givenTotals.finalWt - receivedTotals.finalWt).toFixed(3)
  );

  // Calculate new client balance
  this.newBalance = parseFloat((client.balance + this.balance).toFixed(3));

  // Update client's balance
  client.balance = this.newBalance;
  await client.save();

  // Update receipt totals
  this.totals = {
    grossWt: parseFloat(givenTotals.grossWt.toFixed(3)),
    stoneWt: parseFloat(givenTotals.stoneWt.toFixed(3)),
    netWt: parseFloat(givenTotals.netWt.toFixed(3)),
    finalWt: parseFloat(givenTotals.finalWt.toFixed(3)),
    stoneAmt: parseFloat(givenTotals.stoneAmt.toFixed(2)),
  };

  next();
});

// Post-remove hook to adjust client balance when receipt is deleted
receiptSchema.post("remove", async function (doc) {
  const Client = mongoose.model("Client");
  const client = await Client.findById(doc.clientId);

  if (client) {
    client.balance = parseFloat((client.balance - doc.balance).toFixed(3));
    await client.save();
  }
});

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;

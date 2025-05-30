const mongoose = require("mongoose");

const givenItemSchema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  pureWeight: {
    type: String,
    required: true,
  },
  purePercent: {
    type: String,
    required: true,
  },
  melting: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const receivedItemSchema = mongoose.Schema({
  productName: {
    type: String,
  },
  finalOrnamentsWt: {
    type: String,
  },
  stoneWeight: {
    type: String,
  },
  makingChargePercent: {
    type: String,
  },
  subTotal: {
    type: Number,
  },
  total: {
    type: Number,
  },
});

const adminReceiptSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client",
    },
    clientName: {
      type: String,
      required: true,
    },
    given: {
      date: {
        type: Date,
        required: true,
      },
      items: [givenItemSchema],
      totalPureWeight: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    received: {
      date: {
        type: Date,
      },
      items: [receivedItemSchema],
      totalOrnamentsWt: {
        type: Number,
      },
      totalStoneWeight: {
        type: Number,
      },
      totalSubTotal: {
        type: Number,
      },
      total: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ["complete", "incomplete", "empty"],
      default: "incomplete",
    },
    voucherId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
adminReceiptSchema.index({ clientName: "text" });
adminReceiptSchema.index({ "given.date": 1, "received.date": 1 });
adminReceiptSchema.index({ voucherId: 1 });

const AdminReceipt = mongoose.model("AdminReceipt", adminReceiptSchema);

module.exports = AdminReceipt;

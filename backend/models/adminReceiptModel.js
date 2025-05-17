
const mongoose = require('mongoose');

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
    required: true,
  },
  finalOrnamentsWt: {
    type: String,
    required: true,
  },
  stoneWeight: {
    type: String,
    required: true,
  },
  makingChargePercent: {
    type: String,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const adminReceiptSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
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
        required: true,
      },
      items: [receivedItemSchema],
      totalOrnamentsWt: {
        type: Number,
        required: true,
      },
      totalStoneWeight: {
        type: Number,
        required: true,
      },
      totalSubTotal: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete', 'empty'],
      default: 'incomplete',
    },
    voucherId: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
adminReceiptSchema.index({ clientName: 'text' });
adminReceiptSchema.index({ 'given.date': 1, 'received.date': 1 });
adminReceiptSchema.index({ voucherId: 1 });

const AdminReceipt = mongoose.model('AdminReceipt', adminReceiptSchema);

module.exports = AdminReceipt;


const mongoose = require('mongoose');

const receiptItemSchema = mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  grossWt: {
    type: Number,
    required: true,
  },
  stoneWt: {
    type: Number,
    required: true,
  },
  meltingTouch: {
    type: Number,
    required: true,
  },
  stoneAmt: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
});

const receiptSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    clientInfo: {
      clientName: {
        type: String,
        required: true,
      },
      shopName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
    metalType: {
      type: String,
      required: true,
      enum: ['Gold', 'Silver', 'Platinum', 'Other'],
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [receiptItemSchema],
    totals: {
      grossWt: {
        type: Number,
        required: true,
      },
      stoneWt: {
        type: Number,
        required: true,
      },
      netWt: {
        type: Number,
        required: true,
      },
      finalWt: {
        type: Number,
        required: true,
      },
      stoneAmt: {
        type: Number,
        required: true,
      },
    },
    voucherId: {
      type: String,
      unique: true,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
receiptSchema.index({ voucherId: 1 });
receiptSchema.index({ 'clientInfo.clientName': 'text', 'clientInfo.shopName': 'text' });
receiptSchema.index({ issueDate: 1 });

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;

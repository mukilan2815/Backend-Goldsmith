const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
  {
    shopName: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return v === "" || /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: -Infinity,
    },
    metalType: {
      type: String,
      enum: ["Gold", "Silver", "Platinum", "Other"],
      default: "Gold",
    },
    balanceHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        receiptId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Receipt",
        },
        description: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
clientSchema.index({
  clientName: "text",
  shopName: "text",
  phoneNumber: "text",
});

// Static method to update client balance
clientSchema.statics.updateBalance = async function (
  clientId,
  amount,
  receiptId,
  description = ""
) {
  const client = await this.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  client.balance = parseFloat((client.balance + amount).toFixed(3));

  // Add to balance history
  client.balanceHistory.push({
    amount,
    receiptId,
    description: description || `Balance updated by ${amount.toFixed(3)}`,
  });

  await client.save();
  return client;
};

// Static method to get client balance
clientSchema.statics.getBalance = async function (clientId) {
  const client = await this.findById(clientId).select("balance");
  if (!client) {
    throw new Error("Client not found");
  }
  return client.balance;
};

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

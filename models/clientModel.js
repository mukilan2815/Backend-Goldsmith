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
      // Simple phone validation that allows different formats
      validate: {
        validator: function (v) {
          // Allow empty as it's optional, or validate format if provided
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

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

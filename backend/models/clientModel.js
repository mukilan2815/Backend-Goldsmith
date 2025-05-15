
const mongoose = require('mongoose');

const clientSchema = mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
clientSchema.index({ 
  clientName: 'text', 
  shopName: 'text', 
  phoneNumber: 'text' 
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

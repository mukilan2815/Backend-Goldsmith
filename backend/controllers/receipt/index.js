
const { getReceipts, getReceiptById, getReceiptsByClientId } = require('./getReceiptsController');
const { createReceipt } = require('./createReceiptController');
const { updateReceipt, deleteReceipt } = require('./updateDeleteReceiptController');
const { getVoucherId, searchReceipts, getReceiptStats } = require('./searchStatsController');

module.exports = {
  getReceipts,
  getReceiptById,
  getReceiptsByClientId,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getVoucherId,
  searchReceipts,
  getReceiptStats,
};


const express = require('express');
const router = express.Router();
const { 
  getReceipts,
  getReceiptById,
  getReceiptsByClientId,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getVoucherId,
  searchReceipts,
  getReceiptStats
} = require('../controllers/receiptController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes (can add protection later)
router.route('/').get(getReceipts).post(createReceipt);
router.route('/generate-voucher-id').get(getVoucherId);
router.route('/client/:clientId').get(getReceiptsByClientId);
router.route('/search').get(searchReceipts);
router.route('/stats').get(protect, getReceiptStats);
router.route('/:id').get(getReceiptById).put(updateReceipt).delete(deleteReceipt);

module.exports = router;

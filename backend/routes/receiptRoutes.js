
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

// For development, make routes accessible without authentication
const isProduction = process.env.NODE_ENV === 'production';
const routeHandler = isProduction ? protect : (req, res, next) => next();

// Public routes (can add protection later)
router.route('/').get(getReceipts).post(createReceipt);
router.route('/generate-voucher-id').get(getVoucherId);
router.route('/client/:clientId').get(getReceiptsByClientId);
router.route('/search').get(searchReceipts);
router.route('/stats').get(routeHandler, getReceiptStats);
router.route('/:id').get(getReceiptById).put(updateReceipt).delete(deleteReceipt);

module.exports = router;

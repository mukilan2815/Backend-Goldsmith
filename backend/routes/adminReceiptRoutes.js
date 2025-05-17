
const express = require('express');
const router = express.Router();
const { 
  getAdminReceipts, 
  getAdminReceiptById, 
  createAdminReceipt,
  updateAdminReceipt,
  deleteAdminReceipt,
  searchAdminReceipts,
  getVoucherId
} = require('../controllers/adminReceiptController');

// Public routes (can add protection later)
router.route('/').get(getAdminReceipts).post(createAdminReceipt);
router.route('/generate-voucher-id').get(getVoucherId);
router.route('/search').get(searchAdminReceipts);
router.route('/:id').get(getAdminReceiptById).put(updateAdminReceipt).delete(deleteAdminReceipt);

module.exports = router;


const express = require('express');
const router = express.Router();
const { 
  getClientBills,
  getClientBillById,
  deleteBill,
  downloadBillPDF
} = require('../controllers/billController');

// Public routes (can add protection later)
router.route('/').get(getClientBills);
router.route('/:id').get(getClientBillById).delete(deleteBill);
router.route('/:id/download').get(downloadBillPDF);

module.exports = router;


const express = require('express');
const router = express.Router();
const { 
  getAdminBills,
  getAdminBillById,
  deleteAdminBill,
} = require('../controllers/adminBillController');

// Public routes (can add protection later)
router.route('/').get(getAdminBills);
router.route('/:id').get(getAdminBillById).delete(deleteAdminBill);

module.exports = router;

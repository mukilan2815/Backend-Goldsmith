
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
const { protect } = require('../middleware/authMiddleware');
const isProduction = process.env.NODE_ENV === 'production';
const routeHandler = isProduction ? protect : (req, res, next) => next();
router.route('/')
  .get(getReceipts)
  .post(createReceipt);  

router.route('/generate-voucher-id').get(getVoucherId);
router.route('/client/:clientId').get(getReceiptsByClientId);
router.route('/search').get(searchReceipts);
router.route('/stats').get(routeHandler, getReceiptStats);
router.route('/:id')
  .get(getReceiptById)
  .put(updateReceipt)
  .delete(deleteReceipt);
module.exports = router;

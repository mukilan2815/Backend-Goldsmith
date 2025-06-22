const express = require("express");
const router = express.Router();
const {
  getClientBalance,
  getReceipts,
  getReceiptById,
  getReceiptsByClientId,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getVoucherId,
  searchReceipts,
  getReceiptStats,
} = require("../controllers/receiptController");
const { protect } = require("../middleware/authMiddleware");
const isProduction = process.env.NODE_ENV === "production";
const routeHandler = isProduction ? protect : (req, res, next) => next();
router.route("/").get(getReceipts).post(createReceipt);

router.route("/generate-voucher-id").get(getVoucherId);
router.route("/client/:clientId").get(getReceiptsByClientId);
router.route("/client/:clientId/balance").get(getClientBalance);
router.route("/search").get(searchReceipts);
router.route("/stats").get(routeHandler, getReceiptStats);
// Add this new route
router
  .route("/:id")
  .get(getReceiptById)
  .put(updateReceipt)
  .delete(deleteReceipt);
module.exports = router;

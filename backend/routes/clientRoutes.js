
const express = require('express');
const router = express.Router();
const { 
  getClients, 
  getClientById, 
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats 
} = require('../controllers/clientController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getClients).post(createClient);
router.route('/search').get(searchClients);
router.route('/:id').get(getClientById).put(updateClient).delete(deleteClient);
router.route('/stats').get(protect, getClientStats);

module.exports = router;

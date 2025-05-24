
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

// For development, make routes accessible without authentication
const isProduction = process.env.NODE_ENV === 'production';
const routeHandler = isProduction ? protect : (req, res, next) => next();

// Public routes
router.route('/').get(getClients).post(createClient);
router.route('/search').get(searchClients);
router.route('/:id').get(getClientById).put(updateClient).delete(deleteClient);
router.route('/stats').get(routeHandler, getClientStats);

module.exports = router;

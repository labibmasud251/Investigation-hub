const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Get dashboard data
router.get('/', authenticate, dashboardController.getDashboardData);

module.exports = router; 
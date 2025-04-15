const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// Submit investigation report
router.post('/:investigationId', authenticate, authorize('investigator'), reportController.submitReport);

// Rate investigation report
router.post('/:investigationId/rate', authenticate, authorize('client'), reportController.rateReport);

// Get investigation report
router.get('/:investigationId', authenticate, reportController.getReport);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const investigationController = require('../controllers/investigationController');
const validate = require('../middleware/validate');
const { createInvestigationSchema, updateInvestigationSchema } = require('../models/schemas/investigation.schema');

// Get all investigation requests (with filters)
router.get('/', authenticate, investigationController.getInvestigations);

// Create investigation request
router.post('/', authenticate, authorize('client'), validate(createInvestigationSchema), investigationController.createInvestigation);

// Accept investigation request
router.patch('/:id/accept', authenticate, authorize('investigator'), validate(updateInvestigationSchema), investigationController.acceptInvestigation);

// Complete investigation request
router.patch('/:id/complete', authenticate, authorize('investigator'), validate(updateInvestigationSchema), investigationController.completeInvestigation);

// Decline investigation request (Investigator only)
router.post('/:id/decline', authenticate, authorize('investigator'), investigationController.declineInvestigation);


module.exports = router;

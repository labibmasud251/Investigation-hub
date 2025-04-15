const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.patch('/profile', authenticate, userController.updateProfile);

// Get investigator profile with ratings
router.get('/investigators/:id', authenticate, userController.getInvestigatorProfile);

module.exports = router; 
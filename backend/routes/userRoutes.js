// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

// Only add routes for functions that exist in the controller
if (userController && userController.getAllUsers) {
  router.get('/', authenticateToken, checkRole('manager'), userController.getAllUsers);
}

module.exports = router;

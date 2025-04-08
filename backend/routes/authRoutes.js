const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Only add routes for functions that exist in the controller
if (authController && authController.login) {
  router.post('/login', authController.login);
}

// Conditionally add other routes only if the functions exist
if (authController && authController.register) {
  router.post('/register', authController.register);
}

if (authController && authController.forgotPassword) {
  router.post('/forgot-password', authController.forgotPassword);
}

if (authController && authController.resetPassword) {
  router.post('/reset-password', authController.resetPassword);
}

if (authController && authController.changePassword) {
  router.post('/change-password', authenticateToken, authController.changePassword);
}

if (authController && authController.verifyInvitation) {
  router.get('/verify-invitation/:token', authController.verifyInvitation);
}

if (authController && authController.completeInvitation) {
  router.post('/complete-invitation', authController.completeInvitation);
}

module.exports = router;

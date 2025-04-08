// routes/invitationRoutes.js
const express = require('express');
const invitationController = require('../controllers/invitationController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

// Only managers can invite new employees
// Conditionally add the route only if the controller function exists
if (invitationController && invitationController.inviteEmployee) {
  router.post('/', authenticateToken, checkRole('manager'), invitationController.inviteEmployee);
}

module.exports = router;

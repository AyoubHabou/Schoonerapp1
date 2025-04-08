const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, notificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);

// Get unread count
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

module.exports = router;

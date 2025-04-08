const { Notification, User } = require('../models');

// Create a notification
const createNotification = async (recipientId, type, message, metadata = {}) => {
  try {
    return await Notification.create({
      recipientId,
      type,
      message,
      metadata,
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create a notification for all managers
const notifyAllManagers = async (type, message, metadata = {}) => {
  try {
    const managers = await User.findAll({ where: { role: 'manager' } });
    
    const notifications = [];
    for (const manager of managers) {
      const notification = await Notification.create({
        recipientId: manager.id,
        type,
        message,
        metadata,
        read: false
      });
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error notifying managers:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50 // Limit to recent 50 notifications
    });
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        recipientId: userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.update(
      { read: true },
      { where: { recipientId: userId, read: false } }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.count({
      where: { 
        recipientId: userId,
        read: false
      }
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createNotification,
  notifyAllManagers,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

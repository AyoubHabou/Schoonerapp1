const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

// Associations
Notification.belongsTo(User, {
  foreignKey: {
    name: 'recipientId',
    allowNull: false
  }
});

User.hasMany(Notification, {
  foreignKey: 'recipientId'
});

module.exports = Notification;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clockInTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clockOutTime: {
    type: DataTypes.DATE
  },
  breakStartTime: {
    type: DataTypes.DATE
  },
  breakEndTime: {
    type: DataTypes.DATE
  },
  totalHoursWorked: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('clocked_in', 'on_break', 'clocked_out'),
    defaultValue: 'clocked_in'
  }
});

// Associations
TimeEntry.belongsTo(User, {
  foreignKey: {
    allowNull: false
  }
});
User.hasMany(TimeEntry);

module.exports = TimeEntry;
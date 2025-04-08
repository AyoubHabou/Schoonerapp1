const sequelize = require('../config/database');
const User = require('./User');
const TimeEntry = require('./TimeEntry');


// Sync models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Unable to synchronize database:', error);
  }
};

module.exports = {
  User,
  TimeEntry,
  syncDatabase
};
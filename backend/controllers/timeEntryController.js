const { TimeEntry, User } = require('../models');

// Clock In
const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has an active time entry
    const activeEntry = await TimeEntry.findOne({
      where: {
        UserId: userId,
        status: ['clocked_in', 'on_break']
      }
    });
    
    if (activeEntry) {
      return res.status(400).json({ message: 'You are already clocked in' });
    }
    
    // Create new time entry
    const timeEntry = await TimeEntry.create({
      UserId: userId,
      clockInTime: new Date(),
      status: 'clocked_in'
    });
    
    res.status(201).json({
      message: 'Clocked in successfully',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clocking in', error: error.message });
  }
};

// Start Break
const startBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find active time entry
    const activeEntry = await TimeEntry.findOne({
      where: {
        UserId: userId,
        status: 'clocked_in'
      }
    });
    
    if (!activeEntry) {
      return res.status(400).json({ message: 'No active time entry found' });
    }
    
    // Update time entry
    activeEntry.breakStartTime = new Date();
    activeEntry.status = 'on_break';
    await activeEntry.save();
    
    res.status(200).json({
      message: 'Break started successfully',
      timeEntry: activeEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting break', error: error.message });
  }
};

// End Break
const endBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find active break
    const activeBreak = await TimeEntry.findOne({
      where: {
        UserId: userId,
        status: 'on_break'
      }
    });
    
    if (!activeBreak) {
      return res.status(400).json({ message: 'No active break found' });
    }
    
    // Update time entry
    activeBreak.breakEndTime = new Date();
    activeBreak.status = 'clocked_in';
    await activeBreak.save();
    
    res.status(200).json({
      message: 'Break ended successfully',
      timeEntry: activeBreak
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ending break', error: error.message });
  }
};

// Clock Out
const clockOut = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find active time entry
    const activeEntry = await TimeEntry.findOne({
      where: {
        UserId: userId,
        status: ['clocked_in', 'on_break']
      }
    });
    
    if (!activeEntry) {
      return res.status(400).json({ message: 'No active time entry found' });
    }
    
    // Calculate total hours worked
    const clockOutTime = new Date();
    let totalMilliseconds = clockOutTime - new Date(activeEntry.clockInTime);
    
    // Subtract break time if any
    if (activeEntry.breakStartTime && !activeEntry.breakEndTime) {
      // If on break and clocking out, subtract break time
      totalMilliseconds -= (clockOutTime - new Date(activeEntry.breakStartTime));
    } else if (activeEntry.breakStartTime && activeEntry.breakEndTime) {
      // If break was completed, subtract that time
      totalMilliseconds -= (new Date(activeEntry.breakEndTime) - new Date(activeEntry.breakStartTime));
    }
    
    // Convert to hours
    const totalHoursWorked = totalMilliseconds / (1000 * 60 * 60);
    
    // Update time entry
    activeEntry.clockOutTime = clockOutTime;
    activeEntry.totalHoursWorked = totalHoursWorked.toFixed(2);
    activeEntry.status = 'clocked_out';
    
    if (activeEntry.status === 'on_break') {
      activeEntry.breakEndTime = clockOutTime;
    }
    
    await activeEntry.save();
    
    res.status(200).json({
      message: 'Clocked out successfully',
      timeEntry: activeEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clocking out', error: error.message });
  }
};

// Get user time entries
const getUserTimeEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const timeEntries = await TimeEntry.findAll({
      where: { UserId: userId },
      order: [['clockInTime', 'DESC']]
    });
    
    res.status(200).json({ timeEntries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries', error: error.message });
  }
};

// Get all time entries (managers only)
const getAllTimeEntries = async (req, res) => {
  try {
    const timeEntries = await TimeEntry.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['clockInTime', 'DESC']]
    });
    
    res.status(200).json({ timeEntries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries', error: error.message });
  }
};

// Get active employees
const getActiveEmployees = async (req, res) => {
  try {
    const activeEmployees = await TimeEntry.findAll({
      where: {
        status: ['clocked_in', 'on_break']
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    res.status(200).json({ activeEmployees });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active employees', error: error.message });
  }
};

module.exports = {
  clockIn,
  startBreak,
  endBreak,
  clockOut,
  getUserTimeEntries,
  getAllTimeEntries,
  getActiveEmployees
};

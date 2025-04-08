const express = require('express');
const { clockIn, startBreak, endBreak, clockOut, getUserTimeEntries, getAllTimeEntries, getActiveEmployees } = require('../controllers/timeEntryController');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.post('/clock-in', authenticateToken, clockIn);
router.post('/start-break', authenticateToken, startBreak);
router.post('/end-break', authenticateToken, endBreak);
router.post('/clock-out', authenticateToken, clockOut);
router.get('/my-entries', authenticateToken, getUserTimeEntries);


// Manager routes
router.get('/all', authenticateToken, checkRole('manager'), getAllTimeEntries);
router.get('/active', authenticateToken, checkRole('manager'), getActiveEmployees);

module.exports = router;

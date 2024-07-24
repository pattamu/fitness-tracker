const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const {markAttendance, fetchReportByUser} = require('../controllers/attendance')

// Mark attendance
router.post('/mark', authenticateToken, markAttendance);

// Route to fetch and download attendance report
router.get('/report/:userId', authenticateToken, fetchReportByUser);

module.exports = router;

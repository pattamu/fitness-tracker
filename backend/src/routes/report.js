const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const {allUserAttendanceReport, subscriptionReport, totalSubscriptionReport } = require('../controllers/report')

// Attendance report
router.get('/attendance', authenticateToken, allUserAttendanceReport);

// API to fetch total subscriptions report
router.get('/subscription-report', authenticateToken, subscriptionReport);

router.get('/total-subscription-report', totalSubscriptionReport);

module.exports = router;


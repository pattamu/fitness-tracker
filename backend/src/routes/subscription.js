const express = require('express');
const router = express.Router();

const {authenticateToken} = require('../middleware/auth');
const {subscribeExcercise} = require('../controllers/subscription');

// Subscription wise report
router.post('/subscribe/:excerciseId/:plan', authenticateToken, subscribeExcercise);

module.exports = router;
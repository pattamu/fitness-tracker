const express = require('express');
const router = express.Router();

const {authenticateToken} = require('../middleware/auth');
const {registerUser, loginUser, profile, getUsers, rechargeAccount, getBirthdays} = require('../controllers/user')

// User registration
router.post('/register', registerUser);

// Login endpoint
router.post('/login', loginUser);

router.get('/profile', authenticateToken, profile);

router.get('/getusers', getUsers);

router.post('/recharge', authenticateToken, rechargeAccount);

// Birthday notification (runs daily, could be a cron job in production)
router.get('/birthdays', authenticateToken, getBirthdays);

module.exports = router;

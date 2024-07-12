const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const {authenticateToken} = require('../middleware/auth');
const { sendEmail } = require('../comms/emailService');

// User registration
router.post('/register', async (req, res) => {
    try {
        const { name, age, gender, height, mobile, email, password, city, dob, balance } = req.body;
        // Create a new user instance
        const newUser = await User.create({
            name,
            age,
            gender,
            height,
            mobile,
            email,
            password,
            city,
            dob,
            balance
        });
        // Send a success response
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        // If user not found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        // Set token in response headers
        res.setHeader('Authorization', `Bearer ${token}`);
        // Return user data or token as needed
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/getusers', async (req, res) => {
    try {
        let { limit, skip } = req.query;
        limit = parseInt(limit) || 10; // Default limit to 10 if not provided
        skip = parseInt(skip) || 0; // Default skip to 0 if not provided

        const users = await User.findAll({
            limit: limit,
            offset: skip
            // Add other conditions or sorting as needed
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/recharge', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }

        const { amount } = req.body;
        if (amount <= 0) {
            throw new Error('Recharge amount must be greater than zero');
        }

        user.balance += amount;

        await user.save({ transaction });
        await transaction.commit();

        console.log('Account recharged successfully:', { userId: user.id, newBalance: user.balance });

        res.status(200).json({ msg: 'Account recharged successfully', newBalance: user.balance });
    } catch (error) {
        await transaction.rollback();
        console.error('Error recharging account:', error);
        res.status(400).json({ error: error.message });
    }
});

// Birthday notification (runs daily, could be a cron job in production)
router.get('/birthdays', authenticateToken, async (req, res) => {
    const today = new Date();
    const users = await User.findAll({
        where: sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('birthdate')), today.getMonth() + 1),
        and: sequelize.where(sequelize.fn('date_part', 'day', sequelize.col('birthdate')), today.getDate())
    });

    res.send('Birthday notifications sent');
});

module.exports = router;

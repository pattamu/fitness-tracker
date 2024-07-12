const express = require('express');
const router = express.Router();
const { User, sequelize } = require('../models');
const {authenticateToken} = require('../middleware/auth');
const {workoutMaster, calculateEndDate} = require('../utils/utility');

// Subscription wise report
router.post('/subscribe/:excerciseId/:plan', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }
        const newSubscription = {
            excerciseId: workoutMaster[req.params.excerciseId]['id'],
            plan: req.params.plan.toUpperCase(),
            price: workoutMaster[req.params.excerciseId][`subscription_price_${req.params.plan.toLocaleLowerCase()}`],
            startDate: new Date().toISOString(),
            endDate: calculateEndDate(req.params.plan)
        };
        if (user.balance < newSubscription.price) {
            throw new Error('Insufficient balance');
        }

        user.subscription.push(newSubscription);
        user.balance -= newSubscription.price;

        await user.save({ transaction });
        await transaction.commit();

        console.log('Subscription added successfully:', newSubscription);

        res.send({"msg": 'Subscription added successfully:'});
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding subscription:', error);
        res.status(400).send(error);
    }
});


module.exports = router;
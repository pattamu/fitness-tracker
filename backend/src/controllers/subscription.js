const { User, sequelize } = require('../models');
const { workoutMaster, calculateEndDate } = require('../utils/utility');

// Subscription wise report
const subscribeExcercise = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newSubscription = {
            excerciseId: workoutMaster[req.params.excerciseId]['id'],
            plan: req.params.plan.toUpperCase(),
            price: workoutMaster[req.params.excerciseId][`subscription_price_${req.params.plan.toLocaleLowerCase()}`],
            startDate: new Date().toISOString(),
            endDate: calculateEndDate(req.params.plan)
        };
        if (user.balance < newSubscription.price) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        if (user.subscription.some(user => user.excerciseId === workoutMaster[req.params.excerciseId]['id'])) {
            return res.status(400).json({ error: 'subscription already taken' });
        }
        user.subscription = [...user.subscription, newSubscription];
        user.balance -= newSubscription.price;

        await user.save({ transaction });
        await transaction.commit();

        console.log('Subscription added successfully:', newSubscription);

        res.send({ "msg": 'Subscription added successfully:' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding subscription:', error);
        res.status(500).send(error);
    }
};

module.exports = { subscribeExcercise };
const express = require('express');
const router = express.Router();
const { Workout, User } = require('../models');
const {workoutMaster} = require('../utils/utility');
const {authenticateToken} = require('../middleware/auth');

// Add workout
router.post('/add-workout', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { excerciseId, number, duration, plan } = req.body;

        const workoutDetails = workoutMaster[excerciseId];
        if (!workoutDetails) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const isFreeWorkout = workoutDetails.subscription === 'FREE';
        const hasValidSubscription = user.subscription.some(sub => {
            const now = new Date();
            return sub.plan === plan.toUpperCase() && new Date(sub.startDate) <= now && new Date(sub.endDate) >= now;
        });

        if (!isFreeWorkout && !hasValidSubscription) {
            return res.status(403).json({ error: 'You do not have a valid subscription for this workout' });
        }
        // Create a new workout using Sequelize
        const newWorkout = await Workout.create({
            excerciseId,
            number,
            duration,
            userId: req.user.id,
        });

        res.status(201).json(newWorkout);
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

// View all workouts for a user
router.get('/search/:userId', authenticateToken, async (req, res) => {
    try {
        let workouts = await Workout.findAll({ where: { userId: req.params.userId } });
        workouts = workouts.map(el => {
            el = {...el.toJSON(), ...workoutMaster[el.excerciseId]};
            return el;
        });
        res.send(workouts);
    } catch (error) {
        res.status(400).send(error);
    }
});

// View a single workout by ID
router.get('/search/:userId/:workoutId', authenticateToken, async (req, res) => {
    try {
        let workout = await Workout.findOne({ where: { id: req.params.workoutId, userId: req.params.userId } });
        workout = {...workout.toJSON(), ...workoutMaster[workout.excerciseId]};
        res.send(workout);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update a workout
router.put('/search/:workoutId', authenticateToken, async (req, res) => {
    try {
        const workout = await Workout.findByPk(req.params.workoutId);
        await workout.update(req.body);
        res.send(workout);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a workout
router.delete('/search/:workoutId', authenticateToken, async (req, res) => {
    try {
        const workout = await Workout.findByPk(req.params.workoutId);
        await workout.destroy();
        res.send({ message: 'Workout plan deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/csv', async (req, res) => {
    try {
        console.log("workoutMaster==>", workoutMaster);
        res.send(workoutMaster);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;

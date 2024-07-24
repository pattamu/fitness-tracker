const { Workout, User } = require('../models');
const { workoutMaster } = require('../utils/utility');

// Add workout
const addWorkout = async (req, res) => {
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
        const hasValidSubscription = user?.subscription?.some(sub => {
            const now = new Date();
            console.log("sub==>", sub.excerciseId === excerciseId);
            return sub.excerciseId == excerciseId &&
                sub.plan === plan.toUpperCase() &&
                new Date(sub.startDate) <= now && new Date(sub.endDate) >= now;
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
};

// View all workouts for a user
const getWorkoutsOfUser = async (req, res) => {
    try {
        let workouts = await Workout.findAll({ where: { userId: req.params.userId } });
        workouts = workouts.map(el => {
            el = { ...el.toJSON(), ...workoutMaster[el.excerciseId] };
            delete el.subscription;
            delete el.subscription_price_weekly;
            delete el.subscription_price_monthly;
            delete el.subscription_price_yearly;
            return el;
        });
        res.send(workouts);
    } catch (error) {
        res.status(400).send(error);
    }
};

// View a single workout by ID
const getWorkoutbyId = async (req, res) => {
    try {
        let workout = await Workout.findOne({ where: { id: req.params.workoutId, userId: req.params.userId } });
        workout = { ...workout.toJSON(), ...workoutMaster[workout.excerciseId] };
        delete workout.subscription;
        delete workout.subscription_price_weekly;
        delete workout.subscription_price_monthly;
        delete workout.subscription_price_yearly;
        res.send(workout);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Update a workout
const updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByPk(req.params.workoutId);
        await workout.update(req.body);
        res.send(workout);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a workout
const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByPk(req.params.workoutId);
        await workout.destroy();
        res.send({ message: 'Workout plan deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
};

const getCSV = async (req, res) => {
    try {
        console.log("workoutMaster==>", workoutMaster);
        res.send(workoutMaster);
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { addWorkout, getWorkoutsOfUser, getWorkoutbyId, updateWorkout, deleteWorkout, getCSV };

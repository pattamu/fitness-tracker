const express = require('express');
const router = express.Router();

const {authenticateToken} = require('../middleware/auth');
const { addWorkout, getWorkoutsOfUser, getWorkoutbyId, updateWorkout, deleteWorkout, getCSV} = require('../controllers/workout');

// Add workout
router.post('/add-workout', authenticateToken, addWorkout);

// View all workouts for a user
router.get('/search/:userId', authenticateToken, getWorkoutsOfUser);

// View a single workout by ID
router.get('/search/:userId/:workoutId', authenticateToken, getWorkoutbyId);

// Update a workout
router.put('/update/:workoutId', authenticateToken, updateWorkout);

// Delete a workout
router.delete('/clear/:workoutId', authenticateToken, deleteWorkout);

router.get('/csv', getCSV);

module.exports = router;

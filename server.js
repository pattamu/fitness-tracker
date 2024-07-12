const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const userRoutes = require('./routes/user');
const workoutRoutes = require('./routes/workout');
const reportRoutes = require('./routes/report');
const attendanceRoutes = require('./routes/attendance');
const subscriptionRoutes = require('./routes/subscription');

const {loadWorkoutMaster} = require('./utils/utility')

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Test DB connection and start server
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        return sequelize.sync();
    })
    .then(() => {
        loadWorkoutMaster();
    })
    .then(() => {
        console.log('WorkoutMaster Loaded...');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

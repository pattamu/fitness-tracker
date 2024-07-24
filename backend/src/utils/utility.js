const csvtojson = require('csvtojson');
const path = require('path');
const cron = require('node-cron');
const { User } = require('../models/User');

const workoutMaster = {};

const loadWorkoutMaster = async() => {
    const fileName = path.join(__dirname, '../masters/workoutMaster.csv');
    const jsonArray = await csvtojson().fromFile(fileName);
    for(const json of jsonArray){
        workoutMaster[json['id']] = json;
    }
}

const calculateEndDate = (plan) => {
    const currentDate = new Date();
    switch (plan.toLowerCase()) {
        case 'weekly':
            return new Date(currentDate.setDate(currentDate.getDate() + 7)).toISOString();
        case 'monthly':
            return new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toISOString();
        case 'yearly':
            return new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)).toISOString();
        default:
            throw new Error('Invalid subscription plan');
    }
}

// Scheduled job to clean expired subscriptions every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const users = await User.findAll();

        const now = new Date();

        for (const user of users) {
            const updatedSubscriptions = user.subscription.filter(sub => new Date(sub.endDate) > now);

            if (updatedSubscriptions.length !== user.subscription.length) {
                user.subscription = updatedSubscriptions;
                await user.save();
            }
        }

        console.log('Expired subscriptions cleaned up');
    } catch (error) {
        console.error('Error cleaning expired subscriptions:', error);
    }
});


module.exports = {
    workoutMaster,
    loadWorkoutMaster,
    calculateEndDate
}
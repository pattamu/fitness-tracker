const express = require('express');
const router = express.Router();
const { User, Attendance, sequelize } = require('../models');
const {authenticateToken} = require('../middleware/auth');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

// Attendance report
router.get('/attendance', authenticateToken, async (req, res) => {
    try {
        const attendances = await Attendance.findAll({ where: { userId: req.user.id } });
        res.send(attendances);
    } catch (error) {
        res.status(400).send(error);
    }
});

// API to fetch total subscriptions report
router.get('/subscription-report', authenticateToken, async (req, res) => {
    const { fromDate, toDate, subscriptionPlan, action = 'VIEW' } = req.query;

    try {
        // Fetch all users
        const users = await User.findAll();

        // Filter subscriptions
        let report = users.map(user => {
            const filteredSubscriptions = user.subscription.filter(sub => {
                const startDate = moment(sub.startDate);
                const endDate = moment(sub.endDate);

                return (
                    sub.plan.toLowerCase() === subscriptionPlan.toLowerCase() &&
                    startDate.isBetween(fromDate, toDate, null, '[]') &&
                    endDate.isBetween(fromDate, toDate, null, '[]')
                );
            });

            if (filteredSubscriptions.length > 0) {
                return {
                    userName: user.name,
                    email: user.email,
                    subscriptionPlan: subscriptionPlan.toLowerCase(),
                    subscriptions: filteredSubscriptions
                };
            } else {
                return null;
            }
        }).filter(user => user !== null);
        if (action === "VIEW")
            res.status(200).json(report);
        else if (action === "DOWNLOAD") {
            //write code to download CSV
            // await fs.writeFileSync()
            // res.download(outputPath, `output_${timestamp}.pdf`, (err) => {
            //     if (err) {
            //         console.error(err);
            //         res.status(500).send('Error downloading the file');
            //     } else {
            //         console.log(`PDF saved at ${outputPath}`);
            //     }
            // });
        }
    } catch (error) {
        console.error('Error fetching subscription report:', error);
        res.status(500).json({ error: 'Failed to fetch subscription report' });
    }
});

router.get('/total-subscription-report', authenticateToken, async (req, res) => {
    try {
        const result = await User.findAll({
            attributes: [
                'subscription.plan', // Include any other fields needed for grouping
                [sequelize.fn('count', sequelize.col('subscription')), 'totalCount']
            ],
            group: ['subscription.plan'], // Group by the subscription plan
            raw: true
        });

        // Structure the response as per your requirement
        const formattedResult = result.map(item => ({
            exerciseId: item.exerciseId,
            name: item.name,
            totalMonthlySubscriptionCount: item.subscription.plan === 'monthly' ? item.totalCount : 0,
            totalWeeklySubscriptionCount: item.subscription.plan === 'weekly' ? item.totalCount : 0,
            totalYearlySubscriptionCount: item.subscription.plan === 'yearly' ? item.totalCount : 0
        }));

        res.json(formattedResult);
    } catch (error) {
        console.error('Error fetching total subscription counts:', error);
        res.status(500).json({ error: 'Failed to fetch total subscription counts' });
    }
});


module.exports = router;


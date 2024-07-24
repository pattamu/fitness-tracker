const { User, Attendance, sequelize } = require('../models');
const { workoutMaster } = require('../utils/utility');
const moment = require('moment');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Attendance report
const allUserAttendanceReport = async (req, res) => {
    try {
        const attendances = await Attendance.findAll({ where: { userId: req.user.id } });
        res.send(attendances);
    } catch (error) {
        res.status(400).send(error);
    }
};

// API to fetch total subscriptions report
const subscriptionReport = async (req, res) => {
    const { fromDate, toDate, subscriptionPlan, action = 'VIEW' } = req.query;

    try {
        // Fetch all users
        const users = await User.findAll();

        // Filter subscriptions
        let report = users.flatMap(user => {
            return user.subscription
                .filter(sub => {
                    const startDate = moment(sub.startDate);
                    const endDate = moment(sub.endDate);

                    return (
                        sub.plan.toLowerCase() === subscriptionPlan.toLowerCase() &&
                        startDate.isBefore(moment(toDate).add(1, 'day')) &&
                        endDate.isAfter(moment(fromDate).subtract(1, 'day'))
                    );
                })
                .map(sub => {
                    return {
                        userName: user.name,
                        email: user.email,
                        excersizeName: workoutMaster[sub.excerciseId].name,
                        subscriptionPlan: subscriptionPlan.toLowerCase(),
                        subscriptionPrice: sub.price,
                        startDate: sub.startDate,
                        endDate: sub.endDate
                    }
                });
        });

        if (action === "VIEW")
            res.status(200).json(report);
        else if (action === "DOWNLOAD") {
            const fields = ['userName', 'email', 'excersizeName', 'subscriptionPlan', 'subscriptionPrice', 'startDate', 'endDate'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(report);

            const outputPath = `./subscription_report_${moment().format('YYYYMMDDHHmmss')}.csv`;
            fs.writeFileSync(outputPath, csv);

            res.download(outputPath, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error downloading the file');
                } else {
                    console.log(`CSV saved at ${outputPath}`);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching subscription report:', error);
        res.status(500).json({ error: 'Failed to fetch subscription report' });
    }
};

const totalSubscriptionReport = async (req, res) => {
    try {
        const { fromDate, toDate, action = 'VIEW' } = req.query;

        const from = fromDate ? moment(fromDate) : moment().startOf('year'); // Default to start of current year if no fromDate
        const to = toDate ? moment(toDate) : moment().endOf('year'); // Default to end of current year if no toDate

        const users = await User.findAll();

        // Initialize counters for different subscription plans
        const subscriptionCounts = {
            monthly: { totalCount: 0, userCount: new Set() },
            weekly: { totalCount: 0, userCount: new Set() },
            yearly: { totalCount: 0, userCount: new Set() }
        };

        // Iterate through users and count subscriptions
        users.forEach(user => {
            if (user.subscription && Array.isArray(user.subscription)) {
                user.subscription.forEach(sub => {
                    const plan = sub.plan.toLowerCase();
                    const startDate = moment(sub.startDate);
                    const endDate = moment(sub.endDate);

                    // Check if subscription falls within the date range
                    if (
                        (startDate.isBetween(from, to, null, '[]') || endDate.isBetween(from, to, null, '[]')) ||
                        (startDate.isBefore(to) && endDate.isAfter(from))
                    ) {
                        if (subscriptionCounts[plan]) {
                            subscriptionCounts[plan].totalCount++;
                            subscriptionCounts[plan].userCount.add(user.id); // Track unique users for each plan
                        }
                    }
                });
            }
        });

        // Format the result
        const result = [
            { plan: 'monthly', totalCount: subscriptionCounts.monthly.totalCount, totalUsers: subscriptionCounts.monthly.userCount.size },
            { plan: 'weekly', totalCount: subscriptionCounts.weekly.totalCount, totalUsers: subscriptionCounts.weekly.userCount.size },
            { plan: 'yearly', totalCount: subscriptionCounts.yearly.totalCount, totalUsers: subscriptionCounts.yearly.userCount.size }
        ];

        if (action === "VIEW")
            res.status(200).json(result);
        else if (action === "DOWNLOAD") {
            const fields = ['plan', 'totalCount', 'totalUsers'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(result);

            const outputPath = `./subscription_report_${moment().format('YYYYMMDDHHmmss')}.csv`;
            fs.writeFileSync(outputPath, csv);

            res.download(outputPath, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error downloading the file');
                } else {
                    console.log(`CSV saved at ${outputPath}`);
                }
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
};


module.exports = {allUserAttendanceReport, subscriptionReport, totalSubscriptionReport };


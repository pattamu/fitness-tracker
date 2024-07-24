const { Attendance, User } = require('../models');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Op } = require('sequelize'); // Import Sequelize operators
const { Parser } = require('json2csv');
const fs = require('fs');

// Mark attendance
const markAttendance = async (req, res) => {
    try {
        // Get the current date (start of the day)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        // Get the end of the day
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        // Check if attendance for today already exists
        const existingAttendance = await Attendance.findOne({
            where: {
                userId: req.user.id,
                date: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });
        if (existingAttendance) {
            // If an attendance record exists for today, throw an error
            return res.status(400).json({ error: 'Attendance already marked for today' });
        }

        const attendanceObj = { date: Date.now(), "status": true, "userId": req.user.id }
        console.log(attendanceObj);
        const attendance = await Attendance.create(attendanceObj);
        res.status(201).send(attendance);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Route to fetch and download attendance report
const fetchReportByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Fetch attendance records for the user
        const attendances = await Attendance.findAll({
            where: { userId },
            include: {
                model: User,
                as: 'user',
                attributes: ['name', 'email'] // Select the attributes you want to include
            }
        });
        // Check if there are attendances
        if (!attendances || attendances.length === 0) {
            return res.status(404).json({ error: 'No attendance records found for this user.' });
        }
        // Prepare CSV writer
        const csvWriter = createCsvWriter({
            path: 'attendance_report.csv',
            header: [
                { id: 'id', title: 'ID' },
                { id: 'date', title: 'Date' },
                { id: 'status', title: 'Status' },
                // { id: 'hoursWorked', title: 'Hours Worked' },
                { id: 'userId', title: 'User_ID' },
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'E-Mail' },
            ]
        });
        // Transform attendance data for CSV writing
        const csvData = attendances.map(att => ({
            id: att.id,
            date: att.date,
            status: att.status,
            // hoursWorked: att.hoursWorked,
            userId: att.userId,
            name: att.user.name,
            email: att.user.email
        }));

        // Write to CSV file
        await csvWriter.writeRecords(csvData);

        // Send the file to the client
        res.download('./attendance_report.csv', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error sending file');
            } else {
                console.log('File sent successfully');
            }
        });

        // // Set response headers for CSV download
        // res.setHeader('Content-Type', 'text/csv');
        // res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');

        // // Stream the file to the client
        // const fileStream = fs.createReadStream('attendance_report.csv');
        // fileStream.pipe(res);

        // // Optional: Clean up the generated CSV file after sending
        // fileStream.on('end', () => {
        //     fs.unlinkSync('attendance_report.csv');
        // });

    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).json({ error: 'Failed to generate attendance report.' });
    }
};


module.exports = { markAttendance, fetchReportByUser };

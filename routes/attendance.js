const express = require('express');
const router = express.Router();
const { Attendance } = require('../models');
const {authenticateToken} = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Mark attendance
router.post('/mark', async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).send(attendance);
  } catch (error) {
    res.status(400).send(error);
  }
});


// Route to fetch and download attendance report
router.get('/report/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Fetch attendance records for the user
        const attendances = await Attendance.findAll({ where: { userId } });
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
                { id: 'userId', title: 'User ID' }
            ]
        });

        // Transform attendance data for CSV writing
        const csvData = attendances.map(att => ({
            id: att.id,
            date: att.date,
            status: att.status,
            // hoursWorked: att.hoursWorked,
            userId: att.userId
        }));

        // Write to CSV file
        await csvWriter.writeRecords(csvData);

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');

        // Stream the file to the client
        const fileStream = fs.createReadStream('attendance_report.csv');
        fileStream.pipe(res);

        // Optional: Clean up the generated CSV file after sending
        fileStream.on('end', () => {
            fs.unlinkSync('attendance_report.csv');
        });

    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).json({ error: 'Failed to generate attendance report.' });
    }
});


module.exports = router;

const nodemailer = require('nodemailer');

// Create a transporter with SMTP details (replace with your SMTP service configuration)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pattamusandeep@gmail.com',
        pass: 'your-email-password'
    }
});

// Example function to send email
const sendEmail = async (toEmail, subject, htmlContent) => {
    try {
        // Send email
        const info = await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: toEmail,
            subject: subject,
            html: htmlContent
        });

        console.log('Email sent:', info.messageId);
        return info.messageId;
    } catch (error) {
        console.error('Email error:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = { sendEmail };

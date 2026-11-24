
const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (userEmail, userName) => {
    await transporter.sendMail({
        from: config.EMAIL_USER,
        to: userEmail,
        subject: 'Welcome to GymApp!',
        text: `Hello ${userName},

Welcome to GymApp!

Your account has been registered successfully.

Thank you for joining us.

Regards,
GymApp Team`
    });
};

module.exports = {
    transporter,
    sendWelcomeEmail
};

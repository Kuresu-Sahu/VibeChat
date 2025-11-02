import nodemailer from 'nodemailer';

// Configure transporter using SMTP environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send a simple OTP email to the given recipient.
 * Uses configured SMTP transporter. Caller should handle errors.
 * @param {string} to - recipient email
 * @param {string} otp - one-time code to send
 * @param {number} ttlMinutes - how many minutes until OTP expires
 */
export const sendOtpEmail = async (to, otp, ttlMinutes = 5) => {
    const html = `<p>Your verification code is <strong>${otp}</strong>. It will expire in ${ttlMinutes} minutes.</p>`;
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Your verification code',
        html
    });
};

export default transporter;

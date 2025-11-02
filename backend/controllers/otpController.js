import bcrypt from 'bcryptjs';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { createAndSendOtp } from '../lib/otp.js';

const MAX_ATTEMPTS = 5;

/**
 * Request a registration OTP for the provided email.
 * If the email is already registered and verified, return 409.
 */
export const requestRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) return res.status(409).json({ success: false, message: 'Email already registered' });

        await createAndSendOtp(email);
        res.json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
        console.error('requestRegisterOtp error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Verify the registration OTP. On success marks the user as verified.
 */
export const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

        const otpDoc = await Otp.findOne({ email, purpose: 'register' });
        if (!otpDoc) return res.status(400).json({ success: false, message: 'No OTP requested for this email' });

        if (otpDoc.attempts >= MAX_ATTEMPTS) return res.status(429).json({ success: false, message: 'Too many failed attempts' });
        if (otpDoc.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

        const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
        if (!isMatch) {
            otpDoc.attempts += 1;
            await otpDoc.save();
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        // OTP matched — delete otp and mark user as verified
        await Otp.deleteOne({ _id: otpDoc._id });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'No user found. Please signup first.' });

        user.isVerified = true;
        user.verifiedAt = new Date();
        await user.save();

        res.json({ success: true, message: 'Email verified. You can now login.' });
    } catch (err) {
        console.error('verifyRegisterOtp error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export default { requestRegisterOtp, verifyRegisterOtp };

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from './email.js';

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);
const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);

/**
 * Generate a numeric OTP of the requested length using crypto.randomInt.
 * Returns a string of digits (e.g. '483920').
 */
const generateNumericOtp = (len) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < len; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
};

/**
 * Create an OTP record (hashed) for the given email and send the plain OTP over email.
 * Stores a TTL (expiresAt) and resets attempt counter on upsert.
 * Returns true when the email has been queued/sent successfully.
 */
export const createAndSendOtp = async (email) => {
    const otpPlain = generateNumericOtp(OTP_LENGTH);
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpPlain, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    await Otp.findOneAndUpdate({ email, purpose: 'register' }, { otpHash, expiresAt, attempts: 0 }, { upsert: true, new: true });

    // send email (throws if fails)
    await sendOtpEmail(email, otpPlain, OTP_TTL_MIN);
    return true;
};

export default { createAndSendOtp };

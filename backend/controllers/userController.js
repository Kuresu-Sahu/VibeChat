import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';
import { createAndSendOtp } from '../lib/otp.js';
import streamifier from 'streamifier';

/**
 * Register a new user.
 * - Validates required fields
 * - Prevents duplicate verified accounts
 * - Stores hashed password and marks user as unverified until email OTP is confirmed
 * - Sends verification OTP to the provided email
 */
export const signup = async (req, res) => {
    const { email, fullName, password, bio } = req.body;
    try {
        if (!email || !fullName || !password || !bio) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.json({ success: false, message: 'User already exists' });
            }
            // If exists but not verified, resend OTP
            await createAndSendOtp(email);
            return res.json({ success: true, message: 'User exists but not verified. OTP resent to email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            fullName,
            password: hashedPassword,
            bio,
            isVerified: false
        });

        // send OTP for email verification
        await createAndSendOtp(email);

        res.json({ success: true, userData: newUser, message: 'User registered successfully. Check your email for the verification code.' });
    } catch (error) {
        console.error('signup error:', error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Authenticate a user using email and password.
 * Ensures the account is verified before issuing a JWT.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        if (!userData) return res.json({ success: false, message: 'Invalid credentials' });

        if (!userData.isVerified) return res.json({ success: false, message: 'Email not verified. Please verify your email first.' });

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) return res.json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: 'Login successful' });
    } catch (error) {
        console.error('login error:', error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Return the authenticated user's data (used by client to validate session).
 */
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

/**
 * Update the authenticated user's profile.
 * Supports multipart file upload (req.file) streamed to Cloudinary for profile pictures
 * and falls back to accepting a URL/base64 in `profilePic`.
 */
export const updateProfile = async (req, res) => {
    try {
        // If using multipart/form-data, multer will put the file on req.file
        const { fullName, bio, profilePic } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (req.file && req.file.buffer) {
            // Upload buffer stream to Cloudinary to avoid holding large base64 in JSON
            const streamUpload = (buffer) =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'profilePics' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    });
                    streamifier.createReadStream(buffer).pipe(stream);
                });

            const uploadResult = await streamUpload(req.file.buffer);
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: uploadResult.secure_url }, { new: true });
        } else if (profilePic) {
            // fallback: client sent profilePic as a URL or small base64 string
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true });
        } else {
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
        }

        res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.json({ success: false, message: error.message });
    }
};

import jwt from 'jsonwebtoken';

// Function to generate a JWT token
export const generateToken = (userId) => {
    // Sign token with `userId` field so middleware can read `decoded.userId`
    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET);
    return token;
};
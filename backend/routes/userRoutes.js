import express from 'express';
import multer from 'multer';
import { signup, login, updateProfile, checkAuth } from '../controllers/userController.js';
import { requestRegisterOtp, verifyRegisterOtp } from '../controllers/otpController.js';
import { protectRoute } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post('/request-otp', requestRegisterOtp);
userRouter.post('/verify-otp', verifyRegisterOtp);
// protectRoute first, then parse multipart with multer
userRouter.put("/update-profile", protectRoute, upload.single('profilePic'), updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
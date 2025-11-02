import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import { Server } from 'socket.io';
import messageRouter from './routes/messageRoutes.js';

//Create express app and HTTP server
const app = express();
const server = http.createServer(app);

//Initialize Socket.io
export const io = new Server(server, {
    cors: { origin: '*' }
});

//Store online users
export const userSocketMap = {}; // userId -> socketId

//Socket.io connection
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId)

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    //emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        //emit online users to all connected clients
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

//Middleware
// Log incoming requests content-length for debugging large payloads
app.use((req, res, next) => {
    const len = req.headers['content-length'];
    if (len && Number(len) > 5 * 1024 * 1024) { // 5MB
        console.warn(`Large request incoming: ${req.method} ${req.originalUrl} - Content-Length: ${len}`);
    }
    next();
});

// Increase JSON limit moderately to avoid 413 on slightly larger JSON (adjust as needed).
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

//Sample route
app.use('/api/status', (req, res) => {
    res.json({ status: 'Server is running' });
});
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// Global error handler for nicer 413 responses
app.use((err, req, res, next) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
        console.warn('PayloadTooLargeError:', err.message);
        return res.status(413).json({ success: false, message: 'Request too large. Please reduce upload size or use multipart/form-data for file uploads.' });
    }
    // Pass to default error handler
    next(err);
});

//Database connection
await connectDB();

//Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});